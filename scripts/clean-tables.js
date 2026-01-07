/*
  Script para limpiar tablas de la base de datos.
  
  Uso:
  1. Asegúrate de tener las variables de entorno configuradas en .env
     (Especialmente SUPABASE_SERVICE_ROLE_KEY para permisos de borrado total si tienes RLS estricto)
  2. Ejecuta: node scripts/clean-tables.js
*/

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intento simple de leer .env manualmente
if (!process.env.VITE_SUPABASE_URL) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf-8');
            envConfig.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    if (key && value && !key.startsWith('#')) {
                        process.env[key] = value;
                    }
                }
            });
        }
    } catch (e) {
        console.warn('No se pudo leer .env manualmente.');
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Preferimos la key de servicio para operaciones administrativas, si existe
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan variables de entorno.');
    console.error('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (o SUPABASE_SERVICE_ROLE_KEY) en tu .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTable(tableName) {
    console.log(`🧹 Limpiando tabla: ${tableName}...`);

    // Nota: Delete global requiere permisos. Si usas la anon key,
    // asegúrate de que tus políticas RLS permitan borrar todo (raro) o usa la service_role key.
    const { error, count } = await supabase
        .from(tableName)
        .delete({ count: 'exact' })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack para borrar todo donde id no sea nulo/vacío

    if (error) {
        console.error(`❌ Error limpiando ${tableName}:`, error.message);
    } else {
        console.log(`✅ Tabla ${tableName} limpiada. Registros eliminados: ${count !== null ? count : 'N/A'}`);
    }
}

async function main() {
    console.log('🚀 Iniciando script de limpieza...');

    // Lista de tablas a limpiar
    const tables = ['audit_logs', 'bookings'];

    for (const table of tables) {
        await cleanTable(table);
    }

    console.log('✨ Proceso finalizado.');
}

main();
