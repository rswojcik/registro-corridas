/*
====================================================
 PACE-UTILS.JS - Utilitários de Cálculo de Pace
 Funções corrigidas e otimizadas
====================================================
*/

/**
 * ✅ CALCULAR PACE (min/km) com validações
 * @param {string|number} km - Distância em quilômetros
 * @param {string} tempo - Tempo no formato hh:mm:ss ou mm:ss
 * @returns {string} Pace formatado (ex: "5:30 min/km") ou "-" se inválido
 */
function calcularPace(km, tempo) {
  try {
    // 1. Validar KM
    var kmNum = parseFloat(km);
    if (isNaN(kmNum) || kmNum <= 0) {
      console.warn('⚠️ KM inválido:', km);
      return '-';
    }

    // 2. Fazer parse do tempo
    var p = String(tempo).trim().split(':');
    var h = 0, m = 0, s = 0;

    if (p.length === 3) {
      h = parseInt(p[0], 10);
      m = parseInt(p[1], 10);
      s = parseInt(p[2], 10);
    } else if (p.length === 2) {
      m = parseInt(p[0], 10);
      s = parseInt(p[1], 10);
    } else {
      console.warn('⚠️ Formato de tempo inválido:', tempo);
      return '-';
    }

    // 3. Validar valores do tempo
    if (isNaN(h) || isNaN(m) || isNaN(s)) {
      console.warn('⚠️ Tempo contém valores não numéricos:', tempo);
      return '-';
    }

    // 4. Calcular tempo total em segundos
    var totalSec = h * 3600 + m * 60 + s;
    if (totalSec <= 0) {
      console.warn('⚠️ Tempo total deve ser maior que 0:', totalSec);
      return '-';
    }

    // 5. Calcular pace em segundos por km
    var paceEmSeg = totalSec / kmNum;

    // 6. Formatar resultado
    var paceMin = Math.floor(paceEmSeg / 60);
    var paceSeg = Math.round(paceEmSeg % 60);

    return paceMin + ':' + (paceSeg + '').padStart(2, '0') + ' min/km';

  } catch (e) {
    console.error('❌ Erro ao calcular pace:', e);
    return '-';
  }
}

/**
 * ✅ PARSEAR PACE (converter "5:30 min/km" para segundos)
 * @param {string} p - Pace no formato "M:SS min/km" ou "M:SS"
 * @returns {number} Segundos por km, ou NaN se inválido
 */
function parsePace(p) {
  try {
    var str = String(p || '').trim();
    // Extrai minutos e segundos (ex: "5:30 min/km" → ['5', '30'])
    var match = str.match(/^(\d+):(\d+)/);

    if (!match) {
      return NaN;
    }

    var minutos = parseInt(match[1], 10);
    var segundos = parseInt(match[2], 10);

    // Validar valores
    if (isNaN(minutos) || isNaN(segundos)) {
      return NaN;
    }

    return minutos * 60 + segundos;
  } catch (e) {
    console.error('❌ Erro ao parsear pace:', e);
    return NaN;
  }
}

/**
 * ✅ FORMATAR PACE (converter segundos para "M:SS /km")
 * @param {number} segundos - Segundos por km
 * @returns {string} Pace formatado
 */
function formatPace(segundos) {
  try {
    var s = parseInt(segundos, 10);
    if (isNaN(s) || s < 0) return '-';

    var min = Math.floor(s / 60);
    var seg = s % 60;

    return min + ':' + (seg + '').padStart(2, '0') + ' /km';
  } catch (e) {
    console.error('❌ Erro ao formatar pace:', e);
    return '-';
  }
}

/**
 * ✅ VALIDAR FORMATO DE TEMPO
 * @param {string} tempo - Tempo para validar
 * @returns {boolean} True se válido (hh:mm:ss ou mm:ss)
 */
function validarTempo(tempo) {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(String(tempo).trim());
}

/**
 * ✅ VALIDAR KM E TEMPO JUNTOS
 * @param {string|number} km - Quilômetros
 * @param {string} tempo - Tempo
 * @returns {object} { valido: boolean, erro: string }
 */
function validarKMeTempo(km, tempo) {
  var kmNum = parseFloat(km);

  if (isNaN(kmNum)) {
    return { valido: false, erro: '⚠️ KM deve ser um número válido.' };
  }

  if (kmNum <= 0) {
    return { valido: false, erro: '⚠️ KM deve ser maior que 0.' };
  }

  if (!validarTempo(tempo)) {
    return { valido: false, erro: '⚠️ Tempo inválido. Use hh:mm:ss ou mm:ss.' };
  }

  return { valido: true, erro: null };
}

/**
 * ✅ CALCULAR MELHOR PACE (mínimo)
 * @param {array} dados - Array de corridas com campo 'Pace (min/km)'
 * @returns {number} Melhor pace em segundos, ou null
 */
function calcularMelhorPace(dados) {
  var paces = dados
    .map(function(d) { return parsePace(d['Pace (min/km)']); })
    .filter(function(v) { return !isNaN(v); });

  return paces.length > 0 ? Math.min.apply(null, paces) : null;
}

/**
 * ✅ CALCULAR PACE MEDIANO (mais robusto que média)
 * @param {array} dados - Array de corridas
 * @returns {number} Pace mediano em segundos, ou null
 */
function calcularPaceMediano(dados) {
  var paces = dados
    .map(function(d) { return parsePace(d['Pace (min/km)']); })
    .filter(function(v) { return !isNaN(v); })
    .sort(function(a, b) { return a - b; });

  if (paces.length === 0) return null;

  var mid = Math.floor(paces.length / 2);

  if (paces.length % 2 !== 0) {
    return paces[mid];
  } else {
    return (paces[mid - 1] + paces[mid]) / 2;
  }
}

/**
 * ��� CALCULAR PACE MÉDIO (média aritmética)
 * @param {array} dados - Array de corridas
 * @returns {number} Pace médio em segundos, ou null
 */
function calcularPaceMedia(dados) {
  var paces = dados
    .map(function(d) { return parsePace(d['Pace (min/km)']); })
    .filter(function(v) { return !isNaN(v); });

  if (paces.length === 0) return null;

  var soma = paces.reduce(function(a, b) { return a + b; }, 0);
  return soma / paces.length;
}

/**
 * ✅ OBTER ESTATÍSTICAS COMPLETAS DE PACE
 * @param {array} dados - Array de corridas
 * @returns {object} { melhor, media, mediano, pior, total }
 */
function obterEstatisticasPace(dados) {
  var paces = dados
    .map(function(d) { return parsePace(d['Pace (min/km)']); })
    .filter(function(v) { return !isNaN(v); })
    .sort(function(a, b) { return a - b; });

  if (paces.length === 0) {
    return {
      melhor: null,
      media: null,
      mediano: null,
      pior: null,
      total: 0
    };
  }

  var soma = paces.reduce(function(a, b) { return a + b; }, 0);
  var media = soma / paces.length;
  var mid = Math.floor(paces.length / 2);
  var mediano = paces.length % 2 !== 0 
    ? paces[mid]
    : (paces[mid - 1] + paces[mid]) / 2;

  return {
    melhor: paces[0],
    media: media,
    mediano: mediano,
    pior: paces[paces.length - 1],
    total: paces.length
  };
}

/**
 * ✅ CONVERTER SEGUNDOS PARA FORMATO LEGÍVEL (HH:MM:SS)
 * @param {number} segundosTotais - Segundos
 * @returns {string} Formato "HH:MM:SS"
 */
function formatarTempo(segundosTotais) {
  try {
    var s = parseInt(segundosTotais, 10);
    if (isNaN(s) || s < 0) return '-';

    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var seg = s % 60;

    var resultado = '';
    if (h > 0) resultado += (h + '').padStart(2, '0') + ':';
    resultado += (m + '').padStart(2, '0') + ':';
    resultado += (seg + '').padStart(2, '0');

    return resultado;
  } catch (e) {
    console.error('❌ Erro ao formatar tempo:', e);
    return '-';
  }
}
