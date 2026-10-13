try {
  const { evaluar, redactar } = await import('./motor.mjs');
  process.stdin.setEncoding('utf8');
  let texto = '';
  for await (const trozo of process.stdin) texto += trozo;
  const { bloqueos, avisos } = evaluar(JSON.parse(texto));
  if (bloqueos.length > 0) {
    process.stderr.write(`${bloqueos.map(redactar).join('\n\n')}\n`);
    process.exitCode = 2;
  } else if (avisos.length > 0) {
    const mensaje = avisos.map(redactar).join('\n\n');
    process.stdout.write(JSON.stringify({
      systemMessage: mensaje,
      hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: mensaje },
    }));
  }
} catch {
  process.exitCode = 0;
}
