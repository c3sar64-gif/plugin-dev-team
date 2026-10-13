import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archivo, comando } from './ayuda.mjs';
import sinMigracionesEf from '../../hooks/reglas/sin-migraciones-ef.mjs';
import commitConvencional, { extraerMensaje } from '../../hooks/reglas/commit-convencional.mjs';
import migracionExistente from '../../hooks/reglas/migracion-existente.mjs';

test('sin-migraciones-ef bloquea los comandos de migraciones de EF', () => {
  for (const texto of ['dotnet ef migrations add Inicial', 'cd backend && dotnet ef database update',
    'dotnet.exe ef migrations remove', 'Add-Migration Inicial']) {
    assert.ok(sinMigracionesEf.detectar(comando(texto)), texto);
  }
  assert.ok(sinMigracionesEf.detectar(comando('dotnet ef migrations add X', 'PowerShell')));
});

test('sin-migraciones-ef bloquea archivos en una carpeta Migrations del backend', () => {
  assert.ok(sinMigracionesEf.detectar(archivo('C:/r/backend/src/Molino.Infrastructure/Migrations/20260101_Inicial.cs')));
  assert.ok(sinMigracionesEf.detectar(archivo('/r/backend/Migrations/Snapshot.cs')));
});

test('sin-migraciones-ef deja pasar lo demás', () => {
  assert.equal(sinMigracionesEf.detectar(comando('dotnet build')), null);
  assert.equal(sinMigracionesEf.detectar(comando('dotnet test')), null);
  assert.equal(sinMigracionesEf.detectar(archivo('/r/db/migrations/0001_inicial.sql')), null);
  assert.equal(sinMigracionesEf.detectar(archivo('/r/backend/src/Molino.Core/Pedidos/Pedido.cs')), null);
});

test('extraerMensaje lee comillas, heredoc de Bash y here-string de PowerShell', () => {
  assert.equal(extraerMensaje('git commit -m "feat: alta de pedidos"'), 'feat: alta de pedidos');
  assert.equal(extraerMensaje("git commit -am 'docs: readme'"), 'docs: readme');
  assert.equal(extraerMensaje('git commit --message="feat!: rompe api"'), 'feat!: rompe api');
  assert.equal(
    extraerMensaje('git commit -m "$(cat <<\'EOF\'\nfix(pedidos): corrige total\n\nCo-Authored-By: X\nEOF\n)"'),
    'fix(pedidos): corrige total',
  );
  assert.equal(extraerMensaje("git commit -m @'\nchore: limpia\nmas\n'@"), 'chore: limpia');
});

test('extraerMensaje devuelve null cuando no hay mensaje en el comando', () => {
  for (const texto of ['git commit', 'git commit --amend --no-edit', 'git commit -F mensaje.txt']) {
    assert.equal(extraerMensaje(texto), null, texto);
  }
});

test('commit-convencional bloquea un mensaje que no sigue el formato', () => {
  for (const texto of ['git commit -m "arreglos varios"', 'git add . && git commit -m "Feat: mayúscula"',
    'git commit -m "feat sin dos puntos"', 'git -C repo commit -m "wip"']) {
    assert.ok(commitConvencional.detectar(comando(texto)), texto);
  }
  assert.ok(commitConvencional.detectar(comando("git commit -m @'\ncambios\n'@", 'PowerShell')));
});

test('commit-convencional deja pasar mensajes correctos y casos que no puede leer', () => {
  for (const texto of ['git commit -m "feat: alta de pedidos"', 'git commit -m "fix(web): corrige el foco"',
    'git commit -m "refactor!: cambia el contrato"', 'git commit -m "Merge branch \'main\'"',
    'git commit --amend --no-edit', 'git commit -F mensaje.txt', 'git log --oneline', 'git status']) {
    assert.equal(commitConvencional.detectar(comando(texto)), null, texto);
  }
  assert.equal(commitConvencional.detectar(archivo('/r/a.md', 'git commit -m "x"')), null);
});

test('migracion-existente avisa al editar una migración que ya existe', () => {
  assert.equal(migracionExistente.accion, 'avisar');
  assert.ok(migracionExistente.detectar(archivo('C:/r/db/migrations/0003_pedidos.sql', '', { existe: true })));
  assert.equal(migracionExistente.detectar(archivo('C:/r/db/migrations/0004_nueva.sql', '', { existe: false })), null);
  assert.equal(migracionExistente.detectar(archivo('C:/r/db/scripts/apply.mjs', '', { existe: true })), null);
});
