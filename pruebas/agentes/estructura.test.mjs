import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AGENTES = join(RAIZ, 'agents');
const SKILLS = join(RAIZ, 'skills');

const REVISORES = ['revisor-arquitectura', 'revisor-csharp', 'revisor-react', 'revisor-base-datos', 'revisor-seguridad'];
const DE_TRABAJO = ['planificador', 'guia-pruebas', 'reparador-build'];
const ESPERADOS = [...REVISORES, ...DE_TRABAJO];
const MAX_LINEAS = 200;
const DE_EDICION = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'];
const PROHIBIDO = /next\.js|NEXT_PUBLIC|supabase|minimal api|prisma|drizzle|kysely|django|golang-migrate|server components?|componentes? de servidor|blazor/i;
const FORMATO_COMUN = [
  '[Bloqueante | Importante | Sugerencia] archivo:línea',
  'Regla: <nombre de la regla y dónde está escrita>',
  'Problema: <qué pasa, con la evidencia del código>',
  'Corrección: <qué cambiar>',
  'Veredicto: bloqueado',
  'Sin hallazgos.',
];

const leer = (nombre) => readFileSync(join(AGENTES, `${nombre}.md`), 'utf8');
const frontmatter = (texto) => /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto)?.[1] ?? '';
const campo = (texto, nombre) => new RegExp(`^${nombre}:\\s*(.+)$`, 'm').exec(frontmatter(texto))?.[1].trim();
const lista = (valor) => (valor ?? '').split(',').map((v) => v.trim()).filter(Boolean);

test('existen exactamente los ocho agentes de la especificación', () => {
  const enDisco = existsSync(AGENTES)
    ? readdirSync(AGENTES).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')).sort()
    : [];
  assert.deepEqual(enDisco, [...ESPERADOS].sort());
});

for (const nombre of ESPERADOS) {
  if (!existsSync(join(AGENTES, `${nombre}.md`))) continue;
  const texto = leer(nombre);

  test(`${nombre}: frontmatter correcto`, () => {
    assert.equal(campo(texto, 'name'), nombre);
    const descripcion = campo(texto, 'description') ?? '';
    assert.ok(descripcion.length >= 80, 'la descripción debe decir qué hace y cuándo usarlo');
    assert.match(descripcion, /Úsalo/);
    assert.ok(campo(texto, 'model'), 'falta model');
    assert.ok(lista(campo(texto, 'tools')).length > 0, 'falta tools');
  });

  test(`${nombre}: no pasa de ${MAX_LINEAS} líneas y no nombra otros stacks`, () => {
    assert.ok(texto.split(/\r?\n/).length <= MAX_LINEAS);
    assert.equal(PROHIBIDO.exec(texto)?.[0], undefined);
  });

  test(`${nombre}: las skills que nombra existen en el plugin`, () => {
    const nombradas = [...texto.matchAll(/`ar-dev-team:([a-z-]+)`/g)].map((m) => m[1]);
    for (const skill of new Set([...lista(campo(texto, 'skills')), ...nombradas])) {
      assert.ok(existsSync(join(SKILLS, skill, 'SKILL.md')), `skill inexistente: ${skill}`);
    }
  });
}

for (const nombre of REVISORES) {
  if (!existsSync(join(AGENTES, `${nombre}.md`))) continue;
  const texto = leer(nombre);

  test(`${nombre}: es de solo lectura`, () => {
    const herramientas = lista(campo(texto, 'tools'));
    for (const prohibida of DE_EDICION) {
      assert.ok(!herramientas.includes(prohibida), `un revisor no puede tener ${prohibida}`);
    }
    assert.ok(texto.includes('No modificas ningún archivo'));
  });

  test(`${nombre}: usa el formato común de hallazgos`, () => {
    for (const linea of FORMATO_COMUN) {
      assert.ok(texto.includes(linea), `falta «${linea}»`);
    }
  });

  test(`${nombre}: declara de qué skill toma las reglas`, () => {
    assert.ok(/`ar-dev-team:[a-z-]+`/.test(texto), 'no nombra ninguna skill del plugin');
  });
}
