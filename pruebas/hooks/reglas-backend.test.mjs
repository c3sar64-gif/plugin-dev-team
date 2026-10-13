import { test } from 'node:test';
import assert from 'node:assert/strict';
import { archivo, comando } from './ayuda.mjs';
import dependenciasOnion from '../../hooks/reglas/dependencias-onion.mjs';
import cruceDeContextos from '../../hooks/reglas/cruce-de-contextos.mjs';

const SRC = 'C:/r/backend/src';

test('dependencias-onion bloquea cualquier referencia en el proyecto Core', () => {
  const ruta = `${SRC}/Molino.Core/Molino.Core.csproj`;
  assert.ok(dependenciasOnion.detectar(archivo(ruta, '<PackageReference Include="Npgsql" Version="9.0.0" />')));
  assert.ok(dependenciasOnion.detectar(archivo(ruta, '<ProjectReference Include="..\\Molino.Application\\Molino.Application.csproj" />')));
  assert.equal(dependenciasOnion.detectar(archivo(ruta, '<TargetFramework>net10.0</TargetFramework>')), null);
});

test('dependencias-onion bloquea referencias de proyecto hacia afuera', () => {
  assert.ok(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Application/Molino.Application.csproj`,
    '<ProjectReference Include="..\\Molino.Infrastructure\\Molino.Infrastructure.csproj" />',
  )));
  assert.ok(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Infrastructure/Molino.Infrastructure.csproj`,
    '<ProjectReference Include="../Molino.Api/Molino.Api.csproj" />',
  )));
});

test('dependencias-onion permite las referencias hacia el centro', () => {
  assert.equal(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Application/Molino.Application.csproj`,
    '<ProjectReference Include="..\\Molino.Core\\Molino.Core.csproj" />',
  )), null);
  assert.equal(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Infrastructure/Molino.Infrastructure.csproj`,
    '<ProjectReference Include="..\\Molino.Application\\Molino.Application.csproj" />\n<PackageReference Include="Npgsql" />',
  )), null);
});

test('dependencias-onion bloquea un using hacia una capa exterior', () => {
  assert.ok(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Core/Pedidos/Pedido.cs`, 'using Molino.Application.Common;\nnamespace Molino.Core.Pedidos;',
  )));
  assert.ok(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Application/Pedidos/PedidoService.cs`, 'using System;\nusing Molino.Infrastructure.Persistence;',
  )));
  assert.ok(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Application/Common/Global.cs`, 'global using Molino.Api.Controllers;',
  )));
});

test('dependencias-onion deja pasar usings válidos, pruebas y otros archivos', () => {
  assert.equal(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Application/Pedidos/PedidoService.cs`, 'using Molino.Core.Pedidos;\nusing Molino.Application.Common;',
  )), null);
  assert.equal(dependenciasOnion.detectar(archivo(
    `${SRC}/Molino.Infrastructure/Persistence/MolinoDbContext.cs`, 'using Molino.Application.Common;\nusing Molino.Core.Pedidos;',
  )), null);
  assert.equal(dependenciasOnion.detectar(archivo(
    'C:/r/backend/tests/Molino.Core.Tests/PedidoTests.cs', 'using Molino.Infrastructure.Persistence;',
  )), null);
  assert.equal(dependenciasOnion.detectar(archivo('C:/r/web/src/app/main.tsx', 'using Molino.Api;')), null);
  assert.equal(dependenciasOnion.detectar(comando('dotnet build')), null);
});

test('cruce-de-contextos avisa cuando un contexto de Core usa otro', () => {
  assert.equal(cruceDeContextos.accion, 'avisar');
  assert.ok(cruceDeContextos.detectar(archivo(
    `${SRC}/Molino.Core/Produccion/Echada.cs`, 'using Molino.Core.Pedidos;\nnamespace Molino.Core.Produccion;',
  )));
});

test('cruce-de-contextos permite Common, el propio contexto y lo que no es Core', () => {
  assert.equal(cruceDeContextos.detectar(archivo(
    `${SRC}/Molino.Core/Produccion/Echada.cs`, 'using Molino.Core.Common;\nusing Molino.Core.Produccion;',
  )), null);
  assert.equal(cruceDeContextos.detectar(archivo(
    `${SRC}/Molino.Core/Common/AggregateRoot.cs`, 'using Molino.Core.Pedidos;',
  )), null);
  assert.equal(cruceDeContextos.detectar(archivo(
    `${SRC}/Molino.Application/Produccion/EchadaService.cs`, 'using Molino.Core.Pedidos;',
  )), null);
  assert.equal(cruceDeContextos.detectar(comando('using Molino.Core.Pedidos;')), null);
});
