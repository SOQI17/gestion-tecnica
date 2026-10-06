// Antes de este archivo, cada importador de CSV (EngineerPortal, el ingestor de historial de
// AdminPortal, el de Equipos) reimplementaba su propia normalizacion/comparacion de nombres de
// cliente, con distintos niveles de rigor -- eso es lo que generaba duplicados como
// "CLI-DYN-122-98" junto a "GAYATA S.A." cuando el nombre no calzaba exactamente. Este módulo
// centraliza esa lógica para que todos los importadores compartan el mismo criterio.

// Normaliza un nombre de cliente para comparación: quita tildes, pasa a minúsculas, quita
// sufijos legales comunes (S.A., CIA LTDA, etc.) y nombres de ciudad, colapsa espacios.
//
// El "�" (carácter de reemplazo Unicode, se ve como "�") aparece cuando un nombre con tildes
// se guardó alguna vez con una codificación de texto incorrecta (ej. "María" -> "Mar�a") -- la
// letra original se perdió para siempre, no se puede "arreglar". Se lo QUITA (no se reemplaza por
// espacio) para no partir la palabra en dos (evita "Mar�a" -> "mar a", que ya no se parece en nada
// a "maria" para la comparación de similitud).
export function normalizeClientName(raw: string): string {
  return (raw || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/�/g, '')
    .replace(/\b(s\.?a\.?|c\.?a\.?|cia\.?|ltda\.?|limitada|corp\.?|corporation|inc\.?|incorporated|s\.?a\.?s\.?|de|el|la|los|las)\b/g, '')
    .replace(/-?\s*\b(cue|uio|gye|quito|guayaquil|cuenca|ambato|loja|manta|portoviejo|riobamba)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.substring(i, i + 2));
    return set;
  };
  const setA = bigrams(a);
  const setB = bigrams(b);
  let intersection = 0;
  setA.forEach(bg => { if (setB.has(bg)) intersection++; });
  return (2 * intersection) / (setA.size + setB.size);
}

// Umbral conservador: por encima de esto, dos nombres se consideran "el mismo cliente" aunque
// difieran en ortografía/formato menor. Se mantiene alto a propósito -- un falso-positivo (fusionar
// dos clientes que en realidad son distintos) es más difícil de detectar y revertir que un
// duplicado, así que ante la duda se prefiere crear un cliente nuevo.
const FUZZY_MATCH_THRESHOLD = 0.85;

/**
 * Busca, entre una lista de clientes existentes, el que mejor calce con `rawName` (típicamente
 * una celda de un CSV importado). Devuelve el cliente encontrado o `undefined` si no hay calce
 * suficientemente bueno -- en cuyo caso el llamador debe crear uno nuevo.
 *
 * Estrategia en 3 niveles (de más a menos estricto): coincidencia exacta normalizada, luego
 * substring (uno contiene al otro), luego similitud por bigramas (Sørensen-Dice) con umbral alto.
 */
export function findMatchingClient<T extends { name: string }>(rawName: string, clients: T[]): T | undefined {
  const norm = normalizeClientName(rawName);
  if (!norm) return undefined;

  const exact = clients.find(c => normalizeClientName(c.name) === norm);
  if (exact) return exact;

  const substring = clients.find(c => {
    const cNorm = normalizeClientName(c.name);
    return cNorm.length > 3 && norm.length > 3 && (cNorm.includes(norm) || norm.includes(cNorm));
  });
  if (substring) return substring;

  let best: T | undefined;
  let bestScore = 0;
  clients.forEach(c => {
    const score = diceCoefficient(norm, normalizeClientName(c.name));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  });
  return bestScore >= FUZZY_MATCH_THRESHOLD ? best : undefined;
}
