/*
====================================================
 APP.JS - Registro de Corridas
 Supabase + GitHub Pages
====================================================
*/

// ── Configuração ─────────────────────────────────
// Substitua pelos valores reais do seu projeto Supabase:
// Supabase → Project Settings → API
const SUPABASE_URL = "https://pxsxjizjiqbjgndrosil.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3hqaXpqaXFiamduZHJvc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDQ1MzEsImV4cCI6MjA5Nzg4MDUzMX0.ZN69qRmZlZLWkp3bHehDODyyh4vUQLaxGlqgyKOSoH0"

// O SDK é carregado no <head> do index.html antes deste arquivo
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Mapeamento de campos ──────────────────────────
// Converte snake_case do Supabase para o formato usado pela UI
function mapearCorrida(d) {
  return {
    id:               d.id,
    Nome:             d.nome             || '',
    Data:             d.data             || '',
    KM:               d.km               || '',
    Tempo:            d.tempo            || '',
    'Pace (min/km)':  d.pace             || '',
    'Nº Inscrição':   d.inscricao        || '',
    'Link Resultado': d.link_resultado   || '',
    'Certificado':    d.certificado_url  || '',
    'Observações':    d.observacoes      || '',
    created_at:       d.created_at       || ''
  };
}

// ── Mapeamento de eventos ─────────────────────────
function mapearEvento(d) {
  return {
    id:           d.id,
    Nome:         d.nome            || '',
    Data:         d.data            || '',
    Valor:        d.valor           || 0,
    Link:         d.link            || '',
    created_at:   d.created_at      || ''
  };
}

// ── Buscar corridas ───────────────────────────────
async function buscarCorridas() {
  const { data, error } = await db
    .from('corridas')
    .select('*')
    .order('data', { ascending: false });

  if (error) { console.error('buscarCorridas:', error); return []; }
  return (data || []).map(mapearCorrida);
}

// ── Salvar corrida ────────────────────────────────
async function salvarCorridaSupabase(payload) {
  // payload já vem com snake_case montado pela UI
  const { data, error } = await db
    .from('corridas')
    .insert([payload])
    .select();

  if (error) { console.error('salvarCorrida:', error); throw error; }
  return data[0];
}

// ── Excluir corrida ───────────────────────────────
async function excluirCorridaSupabase(id) {
  const { error } = await db
    .from('corridas')
    .delete()
    .eq('id', id);

  if (error) { console.error('excluirCorrida:', error); throw error; }
  return true;
}

// ── Upload certificado (Supabase Storage) ─────────
async function uploadCertificadoSupabase(file) {
  const nome = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  const { error } = await db.storage
    .from('certificados')
    .upload(nome, file, { cacheControl: '3600', upsert: false });

  if (error) { console.error('uploadCertificado:', error); throw error; }

  const { data } = db.storage.from('certificados').getPublicUrl(nome);
  return data.publicUrl;
}

// ── Buscar eventos ────────────────────────────────
async function buscarEventos() {
  const { data, error } = await db
    .from('eventos')
    .select('*')
    .order('data', { ascending: true });

  if (error) { console.error('buscarEventos:', error); return []; }
  return (data || []).map(mapearEvento);
}

// ── Salvar evento ─────────────────────────────────
async function salvarEventoSupabase(payload) {
  const { data, error } = await db
    .from('eventos')
    .insert([payload])
    .select();

  if (error) { console.error('salvarEvento:', error); throw error; }
  return data[0];
}

// ── Excluir evento ────────────────────────────────
async function excluirEventoSupabase(id) {
  const { error } = await db
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) { console.error('excluirEvento:', error); throw error; }
  return true;
}
