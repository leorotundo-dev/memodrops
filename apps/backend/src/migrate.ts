import { pool } from './db';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations() {
  try {
    console.log('🔄 Executando migrações do banco de dados...');
    
    const schemaPath = path.join(__dirname, '../../../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('✅ Migrações executadas com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao executar migrações:', error.message);
    throw error;
  }
}
