import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const centers = sqliteTable('centers',{id:text('id').primaryKey(),data:text('data').notNull()});
export const appMeta = sqliteTable('app_meta',{key:text('key').primaryKey(),value:text('value').notNull()});
