import { buildServer } from './server';
import { env } from './env';
import { runMigrations } from './migrate';

async function main() {
  // Executar migrações
  await runMigrations();
  
  const app = await buildServer();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`🚀 MemoDrops backend rodando na porta ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
