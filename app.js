/*
====================================================
 APP.JS - Registro de Corridas
 Supabase + GitHub Pages
 
 FUNCIONALIDADES:
 - Autenticação de usuários
 - CRUD de corridas
 - Upload de certificados
 - Gerenciamento de eventos com controle de permissões
 - Relatórios e análises
====================================================
*/

// ── CONFIGURAÇÃO SUPABASE ─────────────────────────────
// Substitua pelos valores reais do seu projeto Supabase:
// Supabase → Project Settings → API
const SUPABASE_URL = "https://pxsxjizjiqbjgndrosil.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3hqaXpqaXFiamduZHJvc2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDQ1MzEsImV4cCI6MjA5Nzg4MDUzMX0.ZN69qRmZl...";

// O SDK é carregado no <head> do index.html antes deste arquivo
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * ═══════════════════════════════════════════════════════════
 * MAPEAMENTO DE DADOS
 * Converte os dados do Supabase (snake_case) para o formato UI
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Mapeia um registro de corrida do Supabase para o formato UI
 * @param {Object} d - Registro bruto do Supabase
 * @returns {Object} Registro mapeado com campos legíveis
 */
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

/**
 * Mapeia um evento do Supabase para o formato UI
 * Inclui o campo owner_email para controle de permissões
 * @param {Object} d - Registro bruto do Supabase
 * @returns {Object} Registro mapeado com campos legíveis
 */
function mapearEvento(d) {
  return {
    id:          d.id,
    Nome:        d.nome         || '',
    Data:        d.data         || '',
    Valor:       d.valor        || 0,
    Link:        d.link         || '',
    owner_email: d.owner_email  || '', // ✅ Campo para verificar permissões
    created_at:  d.created_at   || ''
  };
}

/**
 * ═══════════════════════════════════════════════════════════
 * CORRIDAS - OPERAÇÕES CRUD
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Busca todas as corridas do usuário atual
 * Ordena pela data mais recente
 * @returns {Promise<Array>} Lista de corridas mapeadas
 */
async function buscarCorridas() {
  const { data, error } = await db
    .from('corridas')
    .select('*')
    .order('data', { ascending: false });

  if (error) { 
    console.error('buscarCorridas:', error); 
    return []; 
  }
  return (data || []).map(mapearCorrida);
}

/**
 * Insere um novo registro de corrida no Supabase
 * @param {Object} payload - Dados da corrida em snake_case
 *   - user_email: e-mail do usuário
 *   - nome: nome da corrida/evento
 *   - data: data da corrida (YYYY-MM-DD)
 *   - km: distância em quilômetros
 *   - tempo: tempo total (hh:mm:ss)
 *   - pace: ritmo médio (min/km)
 *   - inscricao: número de inscrição (opcional)
 *   - link_resultado: URL do resultado oficial (opcional)
 *   - certificado_url: URL do certificado no storage (opcional)
 *   - observacoes: notas adicionais (opcional)
 * @returns {Promise<Object>} Registro inserido
 * @throws {Error} Erro ao inserir
 */
async function salvarCorridaSupabase(payload) {
  // payload já vem com snake_case montado pela UI
  const { data, error } = await db
    .from('corridas')
    .insert([payload])
    .select();

  if (error) { 
    console.error('salvarCorrida:', error); 
    throw error; 
  }
  return data[0];
}

/**
 * Remove um registro de corrida do banco
 * @param {number} id - ID da corrida a ser deletada
 * @returns {Promise<boolean>} true se deletado com sucesso
 * @throws {Error} Erro ao deletar
 */
async function excluirCorridaSupabase(id) {
  const { error } = await db
    .from('corridas')
    .delete()
    .eq('id', id);

  if (error) { 
    console.error('excluirCorrida:', error); 
    throw error; 
  }
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════
 * CERTIFICADOS - UPLOAD (Supabase Storage)
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Faz upload de um arquivo de certificado para o Supabase Storage
 * Renomeia o arquivo com timestamp para evitar conflitos
 * @param {File} file - Arquivo a ser enviado (PDF, JPG ou PNG)
 * @returns {Promise<string>} URL pública do arquivo
 * @throws {Error} Erro ao fazer upload
 */
async function uploadCertificadoSupabase(file) {
  // Cria nome único com timestamp para evitar sobrescrita
  const nome = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Faz upload para o bucket 'certificados'
  const { error } = await db.storage
    .from('certificados')
    .upload(nome, file, { cacheControl: '3600', upsert: false });

  if (error) { 
    console.error('uploadCertificado:', error); 
    throw error; 
  }

  // Retorna a URL pública do arquivo
  const { data } = db.storage.from('certificados').getPublicUrl(nome);
  return data.publicUrl;
}

/**
 * ═══════════════════════════════════════════════════════════
 * EVENTOS - OPERAÇÕES CRUD COM CONTROLE DE PERMISSÕES
 * 
 * REGRAS DE NEGÓCIO:
 * - Todos os usuários cadastrados VEEM todos os eventos
 * - Apenas o criador (owner_email) pode EDITAR seu evento
 * - Apenas o criador (owner_email) pode DELETAR seu evento
 * ═══════════════════════════════════════════════════════════
 */

/**
 * Busca TODOS os eventos de TODOS os usuários (visualização pública)
 * Ordena pela data do evento (eventos próximos primeiro)
 * @returns {Promise<Array>} Lista de eventos mapeados com owner_email
 */
async function buscarEventos() {
  const { data, error } = await db
    .from('eventos')
    .select('*')  // Busca todos os eventos, não apenas do usuário atual
    .order('data', { ascending: true });

  if (error) { 
    console.error('buscarEventos:', error); 
    return []; 
  }
  return (data || []).map(mapearEvento);
}

/**
 * Insere um novo evento no banco
 * Registra automaticamente o owner_email para controle de permissões
 * @param {Object} payload - Dados do evento
 *   - user_email: e-mail do usuário (para compatibilidade)
 *   - owner_email: e-mail do criador (para controle de permissões)
 *   - nome: nome do evento
 *   - data: data do evento (YYYY-MM-DD)
 *   - valor: valor da inscrição em R$ (opcional)
 *   - link: URL do evento (opcional)
 * @returns {Promise<Object>} Evento inserido
 * @throws {Error} Erro ao inserir
 */
async function salvarEventoSupabase(payload) {
  const { data, error } = await db
    .from('eventos')
    .insert([payload])
    .select();

  if (error) { 
    console.error('salvarEvento:', error); 
    throw error; 
  }
  return data[0];
}

/**
 * Atualiza um evento existente
 * NÃO verifica permissões aqui - a verificação é feita na UI
 * @param {number} id - ID do evento a atualizar
 * @param {Object} payload - Campos a atualizar
 *   - nome: novo nome (opcional)
 *   - data: nova data (opcional)
 *   - valor: novo valor (opcional)
 *   - link: novo link (opcional)
 * @returns {Promise<Object>} Evento atualizado
 * @throws {Error} Erro ao atualizar
 */
async function atualizarEventoSupabase(id, payload) {
  const { data, error } = await db
    .from('eventos')
    .update(payload)
    .eq('id', id)
    .select();

  if (error) { 
    console.error('atualizarEvento:', error); 
    throw error; 
  }
  return data[0];
}

/**
 * Remove um evento do banco
 * NÃO verifica permissões aqui - a verificação é feita na UI
 * @param {number} id - ID do evento a deletar
 * @returns {Promise<boolean>} true se deletado com sucesso
 * @throws {Error} Erro ao deletar
 */
async function excluirEventoSupabase(id) {
  const { error } = await db
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) { 
    console.error('excluirEvento:', error); 
    throw error; 
  }
  return true;
}
