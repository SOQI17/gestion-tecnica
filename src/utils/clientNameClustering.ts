// Agrupa nombres de cliente en texto libre (sin FK real a Client, ej. ContractGE.cliente) que
// probablemente son el mismo cliente escrito de formas distintas por distintas personas con el
// tiempo (ej. "CLIN.SaN.RAFAEL", "CLINICA SAN RAFAEL", "Clínica San Rafael", "SAN RAFAEL MEDIC
// CIA. LTDA."). Reutiliza el mismo criterio de normalización/similitud que clientMatching.ts.
//
// Bug real que esto corrige: al buscar "rafael" en el selector de cliente de facturas GE,
// aparecían 5 entradas distintas para lo que es el mismo cliente, y el historial de montos/cálculo
// de próximo mes se fragmentaba entre ellas (cada variante de escritura se trataba como un cliente
// aparte).

import { normalizeClientName, diceCoefficient } from './clientMatching';

const CLUSTER_THRESHOLD = 0.85;

export interface ClientNameCluster {
  canonicalName: string;
  variants: string[];
}

function namesAreSimilar(normA: string, normB: string): boolean {
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.length > 3 && normB.length > 3 && (normA.includes(normB) || normB.includes(normA))) return true;
  return diceCoefficient(normA, normB) >= CLUSTER_THRESHOLD;
}

/**
 * Agrupa `rawNames` (puede tener duplicados) en clusters de "probablemente el mismo cliente".
 * Dentro de cada cluster, el nombre canónico es: el que coincide exactamente con algún nombre en
 * `preferredNames` (ej. los Client.name reales ya registrados) si existe uno, si no el más
 * frecuente entre `rawNames`, y si hay empate el más largo (suele ser el más descriptivo/completo).
 */
export function clusterClientNames(rawNames: string[], preferredNames: string[] = []): ClientNameCluster[] {
  const preferredNormSet = new Set(preferredNames.map(normalizeClientName));

  const counts = new Map<string, number>();
  rawNames.forEach(n => {
    const trimmed = (n || '').trim();
    if (!trimmed) return;
    counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
  });

  const uniqueNames = Array.from(counts.keys());

  const clusters: { normReps: string[]; variants: Set<string> }[] = [];

  uniqueNames.forEach(name => {
    const norm = normalizeClientName(name);
    const match = clusters.find(cl => cl.normReps.some(rep => namesAreSimilar(rep, norm)));
    if (match) {
      match.normReps.push(norm);
      match.variants.add(name);
    } else {
      clusters.push({ normReps: [norm], variants: new Set([name]) });
    }
  });

  return clusters.map(cl => {
    const variants = Array.from(cl.variants);
    const preferred = variants.find(v => preferredNormSet.has(normalizeClientName(v)));
    const canonicalName = preferred || variants.reduce((best, current) => {
      const bestCount = counts.get(best) || 0;
      const currentCount = counts.get(current) || 0;
      if (currentCount !== bestCount) return currentCount > bestCount ? current : best;
      return current.length > best.length ? current : best;
    });
    return { canonicalName, variants };
  });
}
