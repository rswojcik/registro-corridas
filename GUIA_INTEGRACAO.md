/*
====================================================
 GUIA DE INTEGRAÇÃO - pace-utils.js → index.html
 Passo a passo para implementar as correções
====================================================
*/

📋 ARQUIVO DE REFERÊNCIA PARA INTEGRAÇÃO
✅ Arquivo criado: pace-utils.js
📍 Local: Raiz do repositório (mesmo nível de index.html e app.js)

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 1: ADICIONAR REFERÊNCIA AO pace-utils.js NO index.html
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Procure na linha ~525 do index.html (seção <head>)

ANTES (código atual):
───────────────────────────────────────────────────────────────────────────────
  <!-- ① SDK Supabase – DEVE vir antes do app.js -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />

  <style>
    ... (estilos CSS) ...
  </style>
</head>
───────────────────────────────────────────────────────────────────────────────

DEPOIS (código corrigido):
───────────────────────────────────────────────────────────────────────────────
  <!-- ① SDK Supabase – DEVE vir antes do app.js -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />

  <style>
    ... (estilos CSS) ...
  </style>
</head>
<body>

  <!-- ... conteúdo HTML ... -->

  <div class="toast" id="toast"></div>

  <!-- ✅ NOVO: pace-utils.js DEVE vir ANTES do app.js -->
  <script src="pace-utils.js"></script>

  <!-- ② app.js DEVE vir depois do SDK acima -->
  <script src="app.js"></script>
───────────────────────────────────────────────────────────────────────────────

✅ CHECKLIST PASSO 1:
  ☐ Adicionou <script src="pace-utils.js"></script>
  ☐ Posicionou ANTES de <script src="app.js"></script>
  ☐ Está dentro da tag </body>, junto com os outros scripts

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 2: REMOVER FUNÇÕES DUPLICADAS (linhas ~775-780)
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Final do arquivo index.html, dentro da última tag <script>

Procure por:
    /* ═══════════════════════════════════
       UTILS
    ════════════════════════════════════ */

ANTES (código atual):
───────────────────────────────────────────────────────────────────────────────
    /* ═══════════════════════════════════
       UTILS
    ════════════════════════════════════ */
    function parsePace(p){var m=String(p||'').match(/^(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:NaN;}
    function formatPace(s){return Math.floor(s/60)+':'+(s%60+'').padStart(2,'0')+' /km';}
    function formatarData(d){if(!d)return '–';var s=String(d);if(/^\d{4}-\d{2}-\d{2}/.test(s)){var p=s.substr(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];}return s;}
    function formatBytes(b){if(b<1024)return b+'B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
    function escHtml(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
───────────────────────────────────────────────────────────────────────────────

DEPOIS (código corrigido):
───────────────────────────────────────────────────────────────────────────────
    /* ═══════════════════════════════════
       UTILS (Pace agora em pace-utils.js)
    ════════════════════════════════════ */
    // ✅ parsePace() → removida (agora em pace-utils.js)
    // ✅ formatPace() → removida (agora em pace-utils.js)
    function formatarData(d){if(!d)return '–';var s=String(d);if(/^\d{4}-\d{2}-\d{2}/.test(s)){var p=s.substr(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];}return s;}
    function formatBytes(b){if(b<1024)return b+'B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
    function escHtml(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
───────────────────────────────────────────────────────────────────────────────

✅ CHECKLIST PASSO 2:
  ☐ Removeu a linha com parsePace()
  ☐ Removeu a linha com formatPace()
  ☐ Manteve formatarData(), formatBytes() e escHtml()
  ☐ Adicionou comentários explicativos

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 3: REMOVER FUNÇÃO calcularPace() DUPLICADA (linhas ~361-371)
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Seção "SALVAR CORRIDA" dentro de <script>

Procure por:
    async function salvarCorrida() {

ANTES dessa função, há uma função calcularPace():
───────────────────────────────────────────────────────────────────────────────
    function validarTempo(t) { return /^\d{1,2}:\d{2}(:\d{2})?$/.test(t); }

    function calcularPace(km, tempo) {
      try {
        var p=String(tempo).split(':'), h=0,m=0,s=0;
        if(p.length===3){h=+p[0];m=+p[1];s=+p[2];}
        else if(p.length===2){m=+p[0];s=+p[1];}
        var tot=(h*3600+m*60+s)/parseFloat(km);
        return Math.floor(tot/60)+':'+(Math.round(tot%60)+'').padStart(2,'0')+' min/km';
      } catch(e){ return '-'; }
    }

    function limparForm() {
───────────────────────────────────────────────────────────────────────────────

DEPOIS (remova apenas calcularPace):
───────────────────────────────────────────────────────────────────────────────
    function validarTempo(t) { return /^\d{1,2}:\d{2}(:\d{2})?$/.test(t); }

    // ✅ calcularPace() → removida (agora em pace-utils.js com validações melhores)

    function limparForm() {
───────────────────────────────────────────────────────────────────────────────

✅ CHECKLIST PASSO 3:
  ☐ Removeu a função completa calcularPace()
  ☐ Manteve validarTempo()
  ☐ Manteve limparForm()

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 4: MELHORAR VALIDAÇÃO EM salvarCorrida() (linhas ~328-335)
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Dentro de async function salvarCorrida()

ANTES (validação atual):
───────────────────────────────────────────────────────────────────────────────
    async function salvarCorrida() {
      if (!usuarioAtual) { showToast('⚠️ Sessão expirada. Faça login novamente.', true); return; }

      var nome    = document.getElementById('nome').value.trim();
      var data    = document.getElementById('data').value;
      var km      = document.getElementById('km').value;
      var tempo   = document.getElementById('tempo').value.trim();
      var obs     = document.getElementById('observacoes').value.trim();
      var insc    = document.getElementById('inscricao').value.trim();
      var linkRes = document.getElementById('linkResultado').value.trim();

      if (!nome||!data||!km||!tempo) { showToast('⚠️ Preencha nome, data, KM e tempo.', true); return; }
      if (!validarTempo(tempo))      { showToast('⚠️ Tempo inválido. Use hh:mm:ss ou mm:ss.', true); return; }
───────────────────────────────────────────────────────────────────────────────

DEPOIS (validação melhorada):
───────────────────────────────────────────────────────────────────────────────
    async function salvarCorrida() {
      if (!usuarioAtual) { showToast('⚠️ Sessão expirada. Faça login novamente.', true); return; }

      var nome    = document.getElementById('nome').value.trim();
      var data    = document.getElementById('data').value;
      var km      = document.getElementById('km').value;
      var tempo   = document.getElementById('tempo').value.trim();
      var obs     = document.getElementById('observacoes').value.trim();
      var insc    = document.getElementById('inscricao').value.trim();
      var linkRes = document.getElementById('linkResultado').value.trim();

      if (!nome||!data||!km||!tempo) { showToast('⚠️ Preencha nome, data, KM e tempo.', true); return; }

      // ✅ Validação melhorada com a nova função
      var validacao = validarKMeTempo(km, tempo);
      if (!validacao.valido) { showToast(validacao.erro, true); return; }
──��────────────────────────────────────────────────────────────────────────────

✅ CHECKLIST PASSO 4:
  ☐ Removeu: if (!validarTempo(tempo)) { ... }
  ☐ Adicionou: var validacao = validarKMeTempo(km, tempo);
  ☐ Adicionou: if (!validacao.valido) { showToast(validacao.erro, true); return; }

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 5: ATUALIZAR renderPainel() COM NOVAS ESTATÍSTICAS (linhas ~412-445)
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Dentro de function renderPainel(dados)

ANTES (cálculo de estatísticas atual):
───────────────────────────────────────────────────────────────────────────────
    function renderPainel(dados) {
      if (!dados.length) {
        document.getElementById('kpi-grid').innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📊</div><p>Nenhuma corrida ainda.</p></div>';
        return;
      }
      var cronologico = dados.slice().reverse();
      var totalKm  = dados.reduce(function(a,d){ return a+(parseFloat(d.KM)||0); },0);
      var pacesSeg = dados.map(function(d){ return parsePace(d['Pace (min/km)']); }).filter(function(v){ return !isNaN(v); });
      var melhor   = pacesSeg.length ? Math.min.apply(null,pacesSeg) : null;
      var mediP    = pacesSeg.length ? pacesSeg.reduce(function(a,b){ return a+b; },0)/pacesSeg.length : null;
───────────────────────────────────────────────────────────────────────────────

DEPOIS (com novas funções):
───────────────────────────────────────────────────────────────────────────────
    function renderPainel(dados) {
      if (!dados.length) {
        document.getElementById('kpi-grid').innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📊</div><p>Nenhuma corrida ainda.</p></div>';
        return;
      }
      var cronologico = dados.slice().reverse();
      var totalKm  = dados.reduce(function(a,d){ return a+(parseFloat(d.KM)||0); },0);

      // ✅ Usar novas funções de estatísticas de pace-utils.js
      var estatisticas = obterEstatisticasPace(dados);
      var melhor   = estatisticas.melhor;
      var mediP    = estatisticas.media;  // ou use .mediano para versão mais robusta
───────────────────────────────────────────────────────────────────────────────

ALTERNATIVA (usar mediana ao invés de média):
───────────────────────────────────────────────────────────────────────────────
      // ✅ Usar mediana ao invés de média (mais robusta a outliers)
      var mediP    = estatisticas.mediano;
───────────────────────────────────────────────────────────────────────────────

✅ CHECKLIST PASSO 5:
  ☐ Removeu as linhas: var pacesSeg = dados.map(...)
  ☐ Removeu as linhas: var melhor = pacesSeg.length ? Math.min... e var mediP = pacesSeg.length ? ...
  ☐ Adicionou: var estatisticas = obterEstatisticasPace(dados);
  ☐ Adicionou: var melhor = estatisticas.melhor;
  ☐ Adicionou: var mediP = estatisticas.media; (ou .mediano)

═══════════════════════════════════════════════════════════════════════════════

🔧 PASSO 6: VERIFICAR CHAMADAS DE calcularPace() (buscar por "calcularPace")
───────────────────────────────────────────────────────────────────────────────

📍 LOCALIZAR: Procure por "calcularPace" em todo o arquivo

Devem haver 1 ou 2 ocorrências em salvarCorridaSupabase() no app.js:

Em app.js (por volta da linha 50):
───────────────────────────────────────────────────────────────────────────────
      pace:            calcularPace(km, tempo),
───────────────────────────────────────────────────────────────────────────────

✅ Esta chamada está CORRETA ✅
   - Agora usará a versão corrigida de pace-utils.js
   - Nenhuma alteração necessária aqui

═══════════════════════════════════════════════════════════════════════════════

📊 RESUMO DAS MUDANÇAS
───────────────────────────────────────────────────────────────────────────────

✅ PASSO 1: Adicionar <script src="pace-utils.js"></script> antes de app.js
✅ PASSO 2: Remover parsePace() e formatPace() da seção UTILS
✅ PASSO 3: Remover calcularPace() da seção SALVAR CORRIDA
✅ PASSO 4: Melhorar validação em salvarCorrida() com validarKMeTempo()
✅ PASSO 5: Atualizar renderPainel() com obterEstatisticasPace()
✅ PASSO 6: Verificar que calcularPace() em app.js continua funcionando

═══════════════════════════════════════════════════════════════════════════════

🎯 BENEFÍCIOS DA MUDANÇA
───────────────────────────────────────────────────────────────────────────────

❌ ANTES (problemas):
   • Divisão por zero quando km = 0
   • Parsing incorreto de pace (operador + mal posicionado)
   • Sem validação de tempo = 0
   • Média simples vulnerável a outliers
   • Código duplicado entre app.js e index.html

✅ DEPOIS (soluções):
   • Validação robusta de KM > 0
   • Parsing correto com tratamento de erros
   • Rejeita tempos inválidos e zero
   • Estatísticas melhores (mediana disponível)
   • Código centralizado e reutilizável
   • Console.warn() para debugging
   • Documentação inline com JSDoc

═══════════════════════════════════════════════════════════════════════════════

🧪 COMO TESTAR
───────────────────────────────────────────────────────────────────────────────

1. Abra o DevTools (F12 → Console)

2. Teste calcularPace():
   calcularPace(10, "00:55:00")    // Deve retornar "5:30 min/km"
   calcularPace(0, "01:00:00")     // Deve retornar "-" (erro)
   calcularPace(10, "00:00:00")    // Deve retornar "-" (tempo zero)

3. Teste parsePace():
   parsePace("5:30 min/km")        // Deve retornar 330 (segundos)
   parsePace("invalido")           // Deve retornar NaN

4. Teste obterEstatisticasPace():
   var dados = [
     { 'Pace (min/km)': '5:30 min/km' },
     { 'Pace (min/km)': '6:00 min/km' },
     { 'Pace (min/km)': '4:45 min/km' }
   ];
   obterEstatisticasPace(dados)    // Deve retornar objeto com estatísticas

5. No formulário, tente:
   • KM = 0, Tempo = 01:00:00  → Deve aparecer "⚠️ KM deve ser maior que 0."
   • KM = 10, Tempo = 00:00:00 → Deve aparecer "⚠️ Tempo total deve ser maior que 0"
   • KM = 10, Tempo = 01:00:00 → Deve calcular corretamente

═══════════════════════════════════════════════════════════════════════════════

❓ DÚVIDAS FREQUENTES
───────────────────────────────────────────────────────────────────────────────

Q: E se eu quiser manter a média ao invés da mediana?
A: Use estatisticas.media em vez de estatisticas.mediano na PASSO 5

Q: Pode haver conflito entre app.js e pace-utils.js?
A: Não! pace-utils.js carrega ANTES de app.js, então está disponível

Q: Como faço para reverter se der problema?
A: Git → git revert HEAD (ou restaure manualmente as funções)

Q: Preciso alterar algo em app.js?
A: Não! O app.js chamará calcularPace() que agora vem de pace-utils.js

═══════════════════════════════════════════════════════════════════════════════

✅ PRÓXIMOS PASSOS
───────────────────────────────────────────────────────────────────────────────

1. Edite index.html conforme os 6 passos acima
2. Salve e commit as mudanças
3. Refresque o navegador (Ctrl+F5 ou Cmd+Shift+R)
4. Teste conforme a seção "COMO TESTAR"
5. Abra DevTools Console e procure por ⚠️ ou ❌ para erros

═══════════════════════════════════════════════════════════════════════════════
