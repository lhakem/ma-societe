// Génère les images PNG (favicon, logo, image de partage) à partir de SVG.
// Usage : node scripts/generate-images.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const fav = readFileSync('public/favicon.svg');
await sharp(fav, { density: 300 }).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(fav, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(fav, { density: 1200 }).resize(512, 512).png().toFile('public/logo.png');

const star = 'M12 4 14.34 6.34 17.66 6.34 17.66 9.66 20 12 17.66 14.34 17.66 17.66 14.34 17.66 12 20 9.66 17.66 6.34 17.66 6.34 14.34 4 12 6.34 9.66 6.34 6.34 9.66 6.34Z';
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="z" width="56" height="56" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#ffffff" stroke-opacity="0.07"><rect x="16" y="16" width="24" height="24"/><path d="M28 11 45 28 28 45 11 28z"/></g>
    </pattern>
    <radialGradient id="glow" cx="85%" cy="10%" r="70%"><stop offset="0" stop-color="#3049e0" stop-opacity="0.55"/><stop offset="1" stop-color="#3049e0" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b1433"/>
  <rect width="1200" height="630" fill="url(#z)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(80 80)">
    <rect width="64" height="64" rx="18" fill="#3049e0"/>
    <g transform="translate(8 8) scale(2)"><path d="${star}" fill="none" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="#f0a93b"/></g>
    <text x="84" y="44" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff">Ma Société<tspan fill="#f0a93b">.ma</tspan></text>
  </g>
  <text font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#ffffff" font-size="68" letter-spacing="-1.5">
    <tspan x="80" y="300">Créez votre société au Maroc,</tspan>
    <tspan x="80" y="380">sans vous déplacer.</tspan>
  </text>
  <rect x="80" y="395" width="560" height="14" rx="4" fill="#f0a93b" fill-opacity="0.55"/>
  <text x="80" y="480" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#c9d0ea">SARL · SARL AU · Auto-entrepreneur · Domiciliation · Comptabilité</text>
  <g transform="translate(80 530)">
    <rect width="300" height="54" rx="27" fill="#3049e0"/>
    <text x="150" y="35" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#fff">Prix fixe affiché</text>
  </g>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile('public/og-default.png');
console.log('Images générées dans /public');
