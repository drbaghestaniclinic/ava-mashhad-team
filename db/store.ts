import { env } from 'cloudflare:workers';
import seed from '@/lib/seed.json';
export function database(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export async function ensureSeed(){const db=database();const ready=await db.prepare('SELECT value FROM app_meta WHERE key = ?').bind('seed-v1').first();if(ready)return;
 // Idempotent data initialization; schema is exclusively owned by migrations.
 await db.batch([...seed.map(c=>db.prepare('INSERT OR IGNORE INTO centers (id,data) VALUES (?,?)').bind(c.id,JSON.stringify(c))),db.prepare('INSERT OR IGNORE INTO app_meta (key,value) VALUES (?,?)').bind('seed-v1','complete')]);
}
