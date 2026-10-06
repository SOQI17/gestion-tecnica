// Parser de montos en dólares que acepta formato estadounidense (1,400.00) y latinoamericano
// (1.400,00), y resuelve el caso ambiguo de "solo punto, sin coma" (ej. "1.400"): un monto en
// dólares nunca tiene 3 dígitos después del punto decimal (los centavos son 1 o 2 dígitos), así
// que si el último grupo tiene exactamente 3 dígitos, el punto es separador de miles, no decimal.
//
// Bug real que esto corrige: facturas GE importadas por CSV con montos como "1.400" o "1.500"
// (mil cuatrocientos, mil quinientos) se guardaban como 1.4 y 1.5 -- 1000 veces menos de lo real.
// La misma ambigüedad aplica con coma sola (alguien tipeando "1,400" al estilo EEUU en el
// formulario manual): se trata igual, para no corromperlo a 1.4 por el camino opuesto.
export function parseDollarAmount(rawStr: string | number): number {
  if (typeof rawStr === 'number') return rawStr;
  if (!rawStr) return 0;
  let str = String(rawStr).trim().replace(/[\$\s]/g, '');
  if (!str) return 0;

  if (str.includes(',') && str.includes('.')) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // e.g. 3.557,25 -> 3557.25
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // e.g. 3,557.25 -> 3557.25
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    const commaCount = (str.match(/,/g) || []).length;
    const afterLastComma = str.slice(str.lastIndexOf(',') + 1);
    if (commaCount > 1 || afterLastComma.length === 3) {
      // Coma como separador de miles: "1,400" -> "1400"
      str = str.replace(/,/g, '');
    } else {
      // Coma como separador decimal: "400,83" -> "400.83"
      str = str.replace(',', '.');
    }
  } else if (str.includes('.')) {
    const dotCount = (str.match(/\./g) || []).length;
    const afterLastDot = str.slice(str.lastIndexOf('.') + 1);
    if (dotCount > 1 || afterLastDot.length === 3) {
      str = str.replace(/\./g, '');
    }
  }

  const val = parseFloat(str);
  return isNaN(val) ? 0 : val;
}
