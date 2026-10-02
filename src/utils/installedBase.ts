// Lógica de parsing para el importador de "Base Instalada" (exportación GE con columnas
// Serial Number/GON/System ID/Shipped Date/Installed Date/CLIENTE). Extraído a su propio archivo
// para poder cubrirlo con pruebas unitarias.

/**
 * Convierte una fecha en formato estadounidense M/D/YYYY (ej. "3/21/2003" = 21 de marzo de 2003)
 * a YYYY-MM-DD. A diferencia del resto de importadores del sistema (que asumen DD/MM/YYYY), este
 * reporte de GE viene en formato US. Devuelve undefined si no reconoce el formato.
 */
export function parseUSDate(raw: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return undefined;
  const month = m[1].padStart(2, '0');
  const day = m[2].padStart(2, '0');
  const year = m[3];
  return `${year}-${month}-${day}`;
}

/**
 * La columna CLIENTE de la base instalada a veces trae solo el nombre, y a veces nombre +
 * dirección separados por coma (ej. "Clinica Bermudez, 0, Av 3 De Julio,178 Y San Miguel, Santo
 * Domingo"). Se toma el primer segmento como nombre y el resto, si existe, como dirección real
 * del cliente nuevo (en vez del placeholder genérico "Dirección por registrar").
 */
export function splitClientNameAndAddress(raw: string): { name: string; addressHint?: string } {
  const cleaned = raw.replace(/^[.:]+\s*/, '').trim();
  const commaIdx = cleaned.indexOf(',');
  if (commaIdx === -1) return { name: cleaned };
  const name = cleaned.slice(0, commaIdx).trim();
  const addressHint = cleaned.slice(commaIdx + 1).trim();
  return { name: name || cleaned, addressHint: addressHint || undefined };
}
