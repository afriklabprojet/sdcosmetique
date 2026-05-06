#!/usr/bin/env node
// Dump l'état brut des rows products pour diagnostiquer in_stock/badges
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ env manquant');
  process.exit(1);
}
const sb = createClient(url, key);

(async () => {
  const { data, error } = await sb
    .from('products')
    .select('id,name,in_stock,stock_qty,badges,is_new,is_bestseller,low_stock_threshold')
    .order('id');
  if (error) {
    console.error('❌', error);
    process.exit(1);
  }
  console.log(`\n=== ${data.length} rows products ===\n`);
  for (const r of data) {
    console.log(
      `[${r.id}] ${r.name?.slice(0, 35).padEnd(35)} | in_stock=${String(r.in_stock).padEnd(5)} | qty=${String(r.stock_qty).padEnd(4)} | badges=${JSON.stringify(r.badges)} | new=${r.is_new} | best=${r.is_bestseller}`,
    );
  }
  const nulls = data.filter((r) => r.in_stock === null || r.in_stock === undefined);
  const falses = data.filter((r) => r.in_stock === false);
  console.log(`\nin_stock NULL: ${nulls.length} | in_stock false: ${falses.length} | total: ${data.length}`);
})();
