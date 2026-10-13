import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILLS = join(RAIZ, 'skills');
const ESPERADAS = ['convenciones-backend', 'convenciones-frontend', 'migraciones-sql', 'commits',
  'pruebas-backend', 'verificar', 'decisiones', 'nueva-funcionalidad', 'revisar', 'nueva-migracion', 'commit'];
const MAX_LINEAS = 150;
const PROHIBIDO = /next\.js|NEXT_PUBLIC|supabase|minimal api|prisma|drizzle|kysely|django|golang-migrate|server components?|componentes? de servidor/i;

const existentes = existsSync(SKILLS)
  ? readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : [];

const leer = (ruta) => readFileSync(ruta, 'utf8');

function archivosMd(carpeta) {
  return readdirSync(carpeta, { withFileTypes: true, recursive: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => join(d.parentPath, d.name));
}

test('existen todas las skills esperadas', () => {
  for (const nombre of ESPERADAS) {
    assert.ok(existentes.includes(nombre), `falta la skill ${nombre}`);
  }
});

for (const nombre of existentes) {
  const carpeta = join(SKILLS, nombre);
  const rutaSkill = join(carpeta, 'SKILL.md');

  test(`${nombre}: SKILL.md con frontmatter correcto`, () => {
    assert.ok(existsSync(rutaSkill), 'falta SKILL.md');
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(leer(rutaSkill))?.[1] ?? '';
    assert.equal(/^name:\s*(.+)$/m.exec(frontmatter)?.[1].trim(), nombre);
    const descripcion = /^description:\s*(.+)$/m.exec(frontmatter)?.[1] ?? '';
    assert.ok(descripcion.length >= 80, 'la descripción debe decir qué cubre y cuándo usarla');
    assert.match(descripcion, /Úsala/);
  });

  test(`${nombre}: SKILL.md no pasa de ${MAX_LINEAS} líneas`, () => {
    assert.ok(leer(rutaSkill).split(/\r?\n/).length <= MAX_LINEAS);
  });

  test(`${nombre}: los enlaces a references existen y no hay referencias huérfanas`, () => {
    const texto = leer(rutaSkill);
    const enlazadas = [...texto.matchAll(/\]\((references\/[^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1]);
    for (const relativa of enlazadas) {
      assert.ok(existsSync(join(carpeta, relativa)), `enlace roto: ${relativa}`);
    }
    const carpetaRefs = join(carpeta, 'references');
    const enDisco = existsSync(carpetaRefs) ? readdirSync(carpetaRefs).map((f) => `references/${f}`) : [];
    for (const relativa of enDisco) {
      assert.ok(enlazadas.includes(relativa), `referencia sin enlazar desde SKILL.md: ${relativa}`);
    }
  });

  test(`${nombre}: sin términos de otros stacks`, () => {
    for (const ruta of archivosMd(carpeta)) {
      const hallado = PROHIBIDO.exec(leer(ruta))?.[0];
      assert.equal(hallado, undefined, `${ruta} menciona «${hallado}»`);
    }
  });
}
