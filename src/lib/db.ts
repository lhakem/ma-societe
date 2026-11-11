/**
 * Base de données de l'espace admin : Cloudflare D1 (SQLite serverless).
 * Binding "DB" déclaré dans wrangler.jsonc. En local, D1 est simulée dans .wrangler/state.
 * Les tables sont créées automatiquement au premier accès.
 */
import { env } from 'cloudflare:workers';
import { site } from '../config/site';
import { computeTotals } from './totals';
import { today, addDays } from './money';

const D = () => env.DB;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT, ice TEXT, phone TEXT, email TEXT, city TEXT, address TEXT,
  service TEXT, source TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  step INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('devis','facture')),
  number TEXT UNIQUE,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  status TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT,
  subject TEXT,
  notes TEXT,
  total_ht INTEGER NOT NULL DEFAULT 0,
  total_tva INTEGER NOT NULL DEFAULT 0,
  total_ttc INTEGER NOT NULL DEFAULT 0,
  paid INTEGER NOT NULL DEFAULT 0,
  source_id INTEGER REFERENCES documents(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS document_lines (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  description TEXT NOT NULL,
  qty REAL NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL DEFAULT 0,
  vat_rate REAL NOT NULL DEFAULT 20
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  method TEXT,
  reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, n INTEGER NOT NULL, until INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_docs_client ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(type, status);
CREATE INDEX IF NOT EXISTS idx_act_client ON activities(client_id);
CREATE INDEX IF NOT EXISTS idx_pay_doc ON payments(document_id)
`;

/* ---------- Accès bas niveau ---------- */
let ready: Promise<unknown> | null = null;
export const ensureSchema = () =>
  (ready ??= D()
    .batch(SCHEMA.split(';').map((s) => s.trim()).filter(Boolean).map((s) => D().prepare(s)))
    .catch((e) => {
      ready = null;
      throw e;
    }));

const norm = (p: unknown[]) => p.map((v) => (v === undefined ? null : v));
const stmt = (sql: string, ...p: unknown[]) => D().prepare(sql).bind(...norm(p));
async function all<T>(sql: string, ...p: unknown[]) {
  await ensureSchema();
  return (await stmt(sql, ...p).all<T>()).results;
}
async function get<T>(sql: string, ...p: unknown[]) {
  await ensureSchema();
  return (await stmt(sql, ...p).first<T>()) ?? undefined;
}
async function run(sql: string, ...p: unknown[]) {
  await ensureSchema();
  return stmt(sql, ...p).run();
}
/** Exécute plusieurs requêtes dans une transaction (tout ou rien). */
async function batch(stmts: D1PreparedStatement[]) {
  await ensureSchema();
  return D().batch(stmts);
}
const activityStmt = (clientId: number | string, kind: string, text: string) =>
  stmt('INSERT INTO activities (client_id, kind, text) VALUES (?, ?, ?)', clientId, kind, text);

/* ======================= Paramètres ======================= */
export const settingDefaults = {
  company_name: site.legalName,
  brand: site.name,
  address: [site.address.street, [site.address.postalCode, site.address.city].filter(Boolean).join(' ')].join(', '),
  phone: site.phoneDisplay,
  email: site.email,
  if: site.legal.if,
  ice: site.legal.ice,
  rc: site.legal.rc,
  tp: site.legal.tp,
  cnss: '',
  bank: '',
  rib: '',
  default_vat: '20',
  devis_validity: '30',
  payment_due: '0',
  payment_terms: 'Paiement à réception de la facture, par virement bancaire ou en espèces.',
  vat_mention: 'TVA non applicable',
  footer: '',
};
export type Settings = typeof settingDefaults;

export async function getSettings(): Promise<Settings> {
  const rows = await all<{ key: string; value: string }>('SELECT key, value FROM settings');
  const s = { ...settingDefaults };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
}
export async function saveSettings(values: Partial<Settings>) {
  const stmts = Object.entries(values)
    .filter(([k]) => k in settingDefaults)
    .map(([k, v]) =>
      stmt('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', k, String(v ?? '')),
    );
  if (stmts.length) await batch(stmts);
}

/* ======================= Limitation de débit (connexion, formulaire) ======================= */
/** Incrémente le compteur `key` sur une fenêtre glissante. Retourne le nombre de tentatives dans la fenêtre. */
export async function hitRateLimit(key: string, windowMs: number): Promise<number> {
  const now = Date.now();
  const r = await get<{ n: number }>(
    `INSERT INTO rate_limits (key, n, until) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       n = CASE WHEN until < ?3 THEN 1 ELSE n + 1 END,
       until = CASE WHEN until < ?3 THEN ?2 ELSE until END
     RETURNING n`,
    key, now + windowMs, now,
  );
  return r?.n ?? 1;
}
export async function rateCount(key: string): Promise<number> {
  const r = await get<{ n: number; until: number }>('SELECT n, until FROM rate_limits WHERE key = ?', key);
  return r && r.until > Date.now() ? r.n : 0;
}
export const clearRateLimit = (key: string) => run('DELETE FROM rate_limits WHERE key = ?', key);

/* ======================= Clients ======================= */
export interface Client {
  id: number;
  name: string;
  company: string | null;
  ice: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  service: string | null;
  source: string | null;
  status: string;
  step: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export type ClientInput = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> & { name: string };

const clientFields = ['name', 'company', 'ice', 'phone', 'email', 'city', 'address', 'service', 'source', 'status', 'step', 'notes'] as const;

export async function listClients(opts: { q?: string; status?: string } = {}) {
  const where: string[] = [];
  const p: unknown[] = [];
  if (opts.q) {
    where.push('(c.name LIKE ? OR c.company LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.ice LIKE ?)');
    const like = `%${opts.q}%`;
    p.push(like, like, like, like, like);
  }
  if (opts.status) {
    where.push('c.status = ?');
    p.push(opts.status);
  }
  return all<Client & { docs: number; due: number }>(
    `SELECT c.*,
       (SELECT COUNT(*) FROM documents d WHERE d.client_id = c.id) AS docs,
       (SELECT COALESCE(SUM(d.total_ttc - d.paid), 0) FROM documents d WHERE d.client_id = c.id AND d.type = 'facture' AND d.status IN ('emise','partielle')) AS due
     FROM clients c ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.updated_at DESC LIMIT 500`,
    ...p,
  );
}

export const clientOptions = () =>
  all<Pick<Client, 'id' | 'name' | 'company'>>('SELECT id, name, company FROM clients ORDER BY name COLLATE NOCASE');
export const clientStatusCounts = () =>
  all<{ status: string; n: number }>('SELECT status, COUNT(*) AS n FROM clients GROUP BY status');
export const countNewLeads = async () =>
  (await get<{ n: number }>("SELECT COUNT(*) AS n FROM clients WHERE status = 'nouveau'"))?.n ?? 0;

export const getClient = (id: number) => get<Client>('SELECT * FROM clients WHERE id = ?', id);

export async function createClient(data: ClientInput, activity = 'Client créé'): Promise<number> {
  const cols = clientFields.filter((f) => data[f] !== undefined);
  const [res] = await batch([
    stmt(`INSERT INTO clients (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, ...cols.map((c) => data[c] ?? null)),
    stmt("INSERT INTO activities (client_id, kind, text) VALUES (last_insert_rowid(), 'creation', ?)", activity),
  ]);
  return Number(res.meta.last_row_id);
}

export async function updateClient(id: number, data: Partial<ClientInput>) {
  const cols = clientFields.filter((f) => data[f] !== undefined);
  if (!cols.length) return;
  await run(
    `UPDATE clients SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`,
    ...cols.map((c) => data[c] ?? null),
    id,
  );
}

export async function deleteClient(id: number): Promise<boolean> {
  const issued = await get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM documents WHERE client_id = ? AND type = 'facture' AND number IS NOT NULL",
    id,
  );
  if (issued && issued.n > 0) return false; // une facture émise ne peut pas disparaître
  await batch([stmt('DELETE FROM documents WHERE client_id = ?', id), stmt('DELETE FROM clients WHERE id = ?', id)]);
  return true;
}

export interface Activity {
  id: number;
  client_id: number;
  kind: string;
  text: string;
  created_at: string;
}
export const addActivity = async (clientId: number, kind: string, text: string) => {
  await batch([activityStmt(clientId, kind, text), stmt("UPDATE clients SET updated_at = datetime('now') WHERE id = ?", clientId)]);
};
export const listActivities = (clientId: number) =>
  all<Activity>('SELECT * FROM activities WHERE client_id = ? ORDER BY created_at DESC, id DESC', clientId);

/* ======================= Devis & factures ======================= */
export interface Doc {
  id: number;
  type: 'devis' | 'facture';
  number: string | null;
  client_id: number;
  status: string;
  issue_date: string;
  due_date: string | null;
  subject: string | null;
  notes: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  paid: number;
  source_id: number | null;
  created_at: string;
  updated_at: string;
}
export interface Line {
  id?: number;
  description: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
}
export interface Payment {
  id: number;
  document_id: number;
  amount: number;
  date: string;
  method: string | null;
  reference: string | null;
}

export async function listDocuments(opts: { type?: string; status?: string; clientId?: number; q?: string } = {}) {
  const where: string[] = [];
  const p: unknown[] = [];
  if (opts.type) where.push('d.type = ?'), p.push(opts.type);
  if (opts.status) where.push('d.status = ?'), p.push(opts.status);
  if (opts.clientId) where.push('d.client_id = ?'), p.push(opts.clientId);
  if (opts.q) {
    where.push('(d.number LIKE ? OR c.name LIKE ? OR c.company LIKE ? OR d.subject LIKE ?)');
    const like = `%${opts.q}%`;
    p.push(like, like, like, like);
  }
  return all<Doc & { client_name: string; client_company: string | null }>(
    `SELECT d.*, c.name AS client_name, c.company AS client_company
     FROM documents d JOIN clients c ON c.id = d.client_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY d.issue_date DESC, d.id DESC LIMIT 500`,
    ...p,
  );
}
export const documentStatusCounts = (type: string) =>
  all<{ status: string; n: number }>('SELECT status, COUNT(*) AS n FROM documents WHERE type = ? GROUP BY status', type);

export async function getDocument(id: number) {
  const doc = await get<Doc>('SELECT * FROM documents WHERE id = ?', id);
  if (!doc) return undefined;
  const [client, lines, payments, source, derived] = await Promise.all([
    getClient(doc.client_id),
    all<Line>('SELECT * FROM document_lines WHERE document_id = ? ORDER BY position', id),
    all<Payment>('SELECT * FROM payments WHERE document_id = ? ORDER BY date, id', id),
    doc.source_id ? get<Doc>('SELECT * FROM documents WHERE id = ?', doc.source_id) : Promise.resolve(undefined),
    all<Doc>('SELECT * FROM documents WHERE source_id = ?', id),
  ]);
  return { doc, client: client!, lines, payments, source, derived };
}

/**
 * Prochain numéro calculé DANS la requête SQL (atomique) : D-2026-0001 / F-2026-0001.
 * Séquentiel par année, sans trou pour les factures (le numéro n'est attribué qu'à l'émission).
 */
const nextNumberSql = (prefixParam: string) =>
  `(SELECT ${prefixParam} || printf('%04d', COALESCE(MAX(CAST(substr(number, length(${prefixParam}) + 1) AS INTEGER)), 0) + 1)
    FROM documents WHERE number LIKE ${prefixParam} || '%')`;

const lineInserts = (docIdSql: string, lines: Line[], docId?: number) =>
  lines.map((l, i) =>
    docId !== undefined
      ? stmt('INSERT INTO document_lines (document_id, position, description, qty, unit_price, vat_rate) VALUES (?, ?, ?, ?, ?, ?)', docId, i, l.description, l.qty, l.unit_price, l.vat_rate)
      : stmt(`INSERT INTO document_lines (document_id, position, description, qty, unit_price, vat_rate) VALUES (${docIdSql}, ?, ?, ?, ?, ?)`, i, l.description, l.qty, l.unit_price, l.vat_rate),
  );

export interface DocInput {
  client_id: number;
  issue_date: string;
  due_date?: string | null;
  subject?: string | null;
  notes?: string | null;
}

export async function createDocument(type: 'devis' | 'facture', data: DocInput, lines: Line[], sourceId?: number): Promise<number> {
  const t = computeTotals(lines);
  const devisPrefix = `D-${data.issue_date.slice(0, 4)}-`;
  // Devis : numéro immédiat. Facture : numéro attribué à l'émission (brouillon modifiable avant).
  const insert =
    type === 'devis'
      ? stmt(
          `INSERT INTO documents (type, number, client_id, status, issue_date, due_date, subject, notes, source_id, total_ht, total_tva, total_ttc)
           VALUES ('devis', ${nextNumberSql('?1')}, ?2, 'brouillon', ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
          devisPrefix, data.client_id, data.issue_date, data.due_date ?? null, data.subject ?? null, data.notes ?? null, sourceId ?? null, t.ht, t.tva, t.ttc,
        )
      : stmt(
          `INSERT INTO documents (type, number, client_id, status, issue_date, due_date, subject, notes, source_id, total_ht, total_tva, total_ttc)
           VALUES ('facture', NULL, ?, 'brouillon', ?, ?, ?, ?, ?, ?, ?, ?)`,
          data.client_id, data.issue_date, data.due_date ?? null, data.subject ?? null, data.notes ?? null, sourceId ?? null, t.ht, t.tva, t.ttc,
        );
  // Dans la transaction, MAX(id) est le document qui vient d'être inséré
  const docIdSql = '(SELECT MAX(id) FROM documents)';
  const results = await batch([
    insert,
    ...lineInserts(docIdSql, lines),
    stmt(
      `INSERT INTO activities (client_id, kind, text)
       SELECT client_id, type, CASE WHEN type = 'devis' THEN 'Devis ' || number || ' créé' ELSE 'Facture créée (brouillon)' END
       FROM documents WHERE id = ${docIdSql}`,
    ),
  ]);
  return Number(results[0].meta.last_row_id);
}

export const isEditable = (d: Doc) => d.status === 'brouillon' || (d.type === 'devis' && d.status === 'envoye');

export async function updateDocument(id: number, data: DocInput, lines: Line[]) {
  const d = await get<Doc>('SELECT * FROM documents WHERE id = ?', id);
  if (!d || !isEditable(d)) throw new Error('Ce document ne peut plus être modifié.');
  const t = computeTotals(lines);
  await batch([
    stmt(
      "UPDATE documents SET client_id = ?, issue_date = ?, due_date = ?, subject = ?, notes = ?, total_ht = ?, total_tva = ?, total_ttc = ?, updated_at = datetime('now') WHERE id = ?",
      data.client_id, data.issue_date, data.due_date ?? null, data.subject ?? null, data.notes ?? null, t.ht, t.tva, t.ttc, id,
    ),
    stmt('DELETE FROM document_lines WHERE document_id = ?', id),
    ...lineInserts('', lines, id),
  ]);
}

export async function setDevisStatus(id: number, status: 'envoye' | 'accepte' | 'refuse' | 'brouillon') {
  const d = await get<Doc>("SELECT * FROM documents WHERE id = ? AND type = 'devis'", id);
  if (!d) return;
  const label = { envoye: 'envoyé', accepte: 'accepté', refuse: 'refusé', brouillon: 'repassé en brouillon' }[status];
  const stmts = [
    stmt("UPDATE documents SET status = ?, updated_at = datetime('now') WHERE id = ?", status, id),
    activityStmt(d.client_id, 'devis', `Devis ${d.number} ${label}`),
    stmt("UPDATE clients SET updated_at = datetime('now') WHERE id = ?", d.client_id),
  ];
  // Le statut du client suit le devis
  if (status === 'envoye') stmts.push(stmt("UPDATE clients SET status = 'devis' WHERE id = ? AND status = 'nouveau'", d.client_id));
  if (status === 'accepte') stmts.push(stmt("UPDATE clients SET status = 'en_cours' WHERE id = ? AND status IN ('nouveau','devis')", d.client_id));
  await batch(stmts);
}

/** Émet une facture : numéro définitif (atomique), date, échéance. Elle n'est plus modifiable ensuite. */
export async function issueFacture(id: number, paymentDueDays: number) {
  const d = await get<Doc>("SELECT * FROM documents WHERE id = ? AND type = 'facture'", id);
  if (!d || d.status !== 'brouillon') throw new Error('Facture déjà émise.');
  if (!d.total_ttc) throw new Error('La facture est vide.');
  const date = today();
  const [res] = await batch([
    stmt(
      `UPDATE documents SET number = ${nextNumberSql('?1')}, status = 'emise', issue_date = ?2,
         due_date = COALESCE(due_date, ?3), updated_at = datetime('now')
       WHERE id = ?4 AND status = 'brouillon'`,
      `F-${date.slice(0, 4)}-`, date, addDays(date, Math.max(0, paymentDueDays)), id,
    ),
    stmt(
      "INSERT INTO activities (client_id, kind, text) SELECT client_id, 'facture', 'Facture ' || number || ' émise' FROM documents WHERE id = ?",
      id,
    ),
  ]);
  if (!res.meta.changes) throw new Error('Facture déjà émise.');
  return (await get<{ number: string }>('SELECT number FROM documents WHERE id = ?', id))!.number;
}

export async function convertToFacture(devisId: number): Promise<number> {
  const full = await getDocument(devisId);
  if (!full || full.doc.type !== 'devis') throw new Error('Devis introuvable.');
  const id = await createDocument(
    'facture',
    { client_id: full.doc.client_id, issue_date: today(), subject: full.doc.subject, notes: full.doc.notes },
    full.lines,
    devisId,
  );
  if (full.doc.status !== 'accepte') await setDevisStatus(devisId, 'accepte');
  return id;
}

export async function addPayment(docId: number, p: { amount: number; date: string; method?: string; reference?: string }) {
  const d = await get<Doc>("SELECT * FROM documents WHERE id = ? AND type = 'facture'", docId);
  if (!d || !['emise', 'partielle'].includes(d.status)) throw new Error('Cette facture ne peut pas recevoir de paiement.');
  if (p.amount <= 0) throw new Error('Montant invalide.');
  await batch([
    stmt('INSERT INTO payments (document_id, amount, date, method, reference) VALUES (?, ?, ?, ?, ?)', docId, p.amount, p.date, p.method ?? null, p.reference ?? null),
    stmt(
      `UPDATE documents SET paid = paid + ?1,
         status = CASE WHEN paid + ?1 >= total_ttc THEN 'payee' ELSE 'partielle' END,
         updated_at = datetime('now') WHERE id = ?2`,
      p.amount, docId,
    ),
    activityStmt(d.client_id, 'paiement', `Paiement reçu sur ${d.number} (${(p.amount / 100).toFixed(2)} MAD)`),
  ]);
}

export async function deletePayment(paymentId: number) {
  const p = await get<Payment>('SELECT * FROM payments WHERE id = ?', paymentId);
  if (!p) return;
  await batch([
    stmt('DELETE FROM payments WHERE id = ?', paymentId),
    stmt(
      `UPDATE documents SET paid = MAX(0, paid - ?1),
         status = CASE WHEN MAX(0, paid - ?1) = 0 THEN 'emise' WHEN MAX(0, paid - ?1) >= total_ttc THEN 'payee' ELSE 'partielle' END,
         updated_at = datetime('now') WHERE id = ?2`,
      p.amount, p.document_id,
    ),
  ]);
}

export async function cancelFacture(id: number, reason: string) {
  const d = await get<Doc>("SELECT * FROM documents WHERE id = ? AND type = 'facture'", id);
  if (!d || d.status === 'brouillon' || d.status === 'annulee' || d.paid > 0)
    throw new Error('Seule une facture émise et non payée peut être annulée.');
  await batch([
    stmt(
      "UPDATE documents SET status = 'annulee', notes = TRIM(COALESCE(notes, '') || char(10) || ?), updated_at = datetime('now') WHERE id = ?",
      `Annulée : ${reason}`, id,
    ),
    activityStmt(d.client_id, 'facture', `Facture ${d.number} annulée (${reason})`),
  ]);
}

/** Suppression : uniquement devis, ou facture encore en brouillon (aucun numéro attribué). */
export async function deleteDocument(id: number): Promise<boolean> {
  const d = await get<Doc>('SELECT * FROM documents WHERE id = ?', id);
  if (!d || (d.type === 'facture' && d.number)) return false;
  await batch([
    stmt('UPDATE documents SET source_id = NULL WHERE source_id = ?', id),
    stmt('DELETE FROM documents WHERE id = ?', id),
    activityStmt(d.client_id, d.type, d.type === 'devis' ? `Devis ${d.number} supprimé` : 'Brouillon de facture supprimé'),
  ]);
  return true;
}

/* ======================= Tableau de bord ======================= */
export async function dashboard() {
  await ensureSchema();
  const month = today().slice(0, 7);
  const now = today();
  const r = await D().batch([
    stmt("SELECT COUNT(*) AS n FROM clients WHERE status = 'nouveau'"),
    stmt("SELECT COUNT(*) AS n FROM clients WHERE status = 'en_cours'"),
    stmt("SELECT COUNT(*) AS n, COALESCE(SUM(total_ttc),0) AS s FROM documents WHERE type='devis' AND status='envoye'"),
    stmt("SELECT COALESCE(SUM(total_ttc),0) AS s FROM documents WHERE type='facture' AND number IS NOT NULL AND status != 'annulee' AND substr(issue_date,1,7) = ?", month),
    stmt('SELECT COALESCE(SUM(amount),0) AS s FROM payments WHERE substr(date,1,7) = ?', month),
    stmt("SELECT COUNT(*) AS n, COALESCE(SUM(total_ttc - paid),0) AS s FROM documents WHERE type='facture' AND status IN ('emise','partielle')"),
    stmt("SELECT COUNT(*) AS n FROM documents WHERE type='facture' AND status IN ('emise','partielle') AND due_date < ?", now),
    stmt("SELECT * FROM clients WHERE status = 'en_cours' ORDER BY updated_at DESC LIMIT 12"),
    stmt("SELECT * FROM clients WHERE status = 'nouveau' ORDER BY created_at DESC LIMIT 8"),
    stmt("SELECT d.*, c.name AS client_name FROM documents d JOIN clients c ON c.id = d.client_id WHERE d.type='facture' AND d.status IN ('emise','partielle') ORDER BY d.due_date LIMIT 10"),
    stmt('SELECT a.*, c.name AS client_name FROM activities a JOIN clients c ON c.id = a.client_id ORDER BY a.created_at DESC, a.id DESC LIMIT 12'),
  ]);
  const one = <T>(i: number) => r[i].results[0] as T;
  return {
    stats: {
      nouveaux: one<{ n: number }>(0).n,
      enCours: one<{ n: number }>(1).n,
      devisAttente: one<{ n: number; s: number }>(2),
      factureMois: one<{ s: number }>(3).s,
      encaisseMois: one<{ s: number }>(4).s,
      impayes: one<{ n: number; s: number }>(5),
      enRetard: one<{ n: number }>(6).n,
    },
    inProgress: r[7].results as Client[],
    leads: r[8].results as Client[],
    unpaid: r[9].results as (Doc & { client_name: string })[],
    activity: r[10].results as (Activity & { client_name: string })[],
  };
}

/* ======================= Export / sauvegarde ======================= */
export const exportDocuments = (type: 'devis' | 'facture') =>
  all<Doc & { client_name: string; client_company: string | null; client_ice: string | null }>(
    `SELECT d.*, c.name AS client_name, c.company AS client_company, c.ice AS client_ice
     FROM documents d JOIN clients c ON c.id = d.client_id
     WHERE d.type = ? ${type === 'facture' ? 'AND d.number IS NOT NULL' : ''}
     ORDER BY d.issue_date, d.number`,
    type,
  );

export async function exportAll() {
  const tables = ['clients', 'activities', 'documents', 'document_lines', 'payments', 'settings'] as const;
  await ensureSchema();
  const res = await D().batch(tables.map((t) => D().prepare(`SELECT * FROM ${t} ORDER BY rowid`)));
  return Object.fromEntries(tables.map((t, i) => [t, res[i].results]));
}
