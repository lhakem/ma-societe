/// <reference types="@cloudflare/workers-types" />

declare namespace App {
  interface Locals {
    admin: { email: string } | null;
  }
}

// Bindings Cloudflare (wrangler.jsonc), accessibles via `import { env } from 'cloudflare:workers'`
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
