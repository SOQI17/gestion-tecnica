// Extraído de AdminPortal.tsx para poder cubrirlo con pruebas unitarias: es lógica pura (sin
// React ni Firestore) que calcula el cronograma de visitas preventivas de un contrato, y ya tuvo
// un bug real (el de periodicidad "Cuatrimestral" mostrando "cada 3 meses" en el cronograma
// impreso) que solo se detectó porque un usuario lo reportó en producción.

/**
 * Genera las fechas de mantenimiento preventivo de un contrato entre `startDateStr` y
 * `endDateStr`, según la frecuencia indicada.
 *
 * Modo AUTO (sin `preferredMonth`): calcula el primer mes hacia atrás desde el vencimiento, de
 * forma que el ÚLTIMO mantenimiento quede ~1 mes antes de que expire la garantía/contrato (en vez
 * de caer justo en el mes de vencimiento). Ej: garantía de 12 meses desde el 15/ene, frecuencia
 * trimestral → visitas el 15/mar, 15/jun, 15/sep y 15/dic (la última queda 1 mes antes del
 * vencimiento del 15/ene siguiente, en vez de caer el mismo 15/ene).
 *
 * Modo con `preferredMonth` (1-12): ancla las visitas a ese mes del año en vez de calcular hacia
 * atrás desde el vencimiento.
 */
export const generateMaintenanceDates = (
  startDateStr: string,
  endDateStr: string,
  frequency: string,
  contractType: string,
  preferredDay?: number,
  targetEquipment?: string,
  preferredMonth?: number
): string[] => {
  if (!startDateStr || !endDateStr || !frequency || frequency === 'Ninguno' || frequency === 'Personalizado') {
    return [];
  }
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (start > end) return [];

  const dates: string[] = [];

  let incrementMonths = 1;
  if (frequency === 'Mensual') incrementMonths = 1;
  else if (frequency === 'Bimestral') incrementMonths = 2;
  else if (frequency === 'Trimestral') incrementMonths = 3;
  else if (frequency === 'Cuatrimestral') incrementMonths = 4;
  else if (frequency === 'Semestral') incrementMonths = 6;
  else if (frequency === 'Anual') incrementMonths = 12;

  const targetDay = (preferredDay && preferredDay >= 1 && preferredDay <= 31)
    ? preferredDay
    : start.getDate();

  let year = start.getFullYear();
  let month = start.getMonth();

  // Tope del bucle: normalmente la fecha de vencimiento real, salvo en modo AUTO donde se
  // recorta ~1 mes antes (ver más abajo) para que el último mantenimiento no caiga justo
  // en el mes de expiración de la garantía/contrato.
  let loopEnd = end;

  if (preferredMonth && preferredMonth >= 1 && preferredMonth <= 12) {
    month = preferredMonth - 1; // 0-indexed (e.g. Feb = 1)

    // Find the first year on or after start where candidate date >= start
    let daysInM = new Date(year, month + 1, 0).getDate();
    let cDay = Math.min(targetDay, daysInM);
    let candidate = new Date(year, month, cDay);

    while (candidate < start) {
      year++;
      daysInM = new Date(year, month + 1, 0).getDate();
      cDay = Math.min(targetDay, daysInM);
      candidate = new Date(year, month, cDay);
    }
  } else {
    // AUTO: calcular el primer mes hacia atrás desde el vencimiento, de forma que el ÚLTIMO
    // mantenimiento quede ~1 mes antes de que expire la garantía/contrato (en vez de caer
    // justo en el mes de vencimiento). Ej: garantía de 12 meses, frecuencia trimestral →
    // visitas en el mes 2, 5, 8 y 11 (no 3, 6, 9, 12).
    const bufferMonths = 1;
    const startIndex = start.getFullYear() * 12 + start.getMonth();
    const endIndex = end.getFullYear() * 12 + end.getMonth();
    let targetLastIndex = endIndex - bufferMonths;
    if (targetLastIndex < startIndex) targetLastIndex = endIndex; // periodo muy corto: sin margen

    const span = targetLastIndex - startIndex;
    const remainder = span % incrementMonths;
    const firstOffset = span <= 0 ? incrementMonths : (remainder === 0 ? incrementMonths : remainder);

    const firstIndex = startIndex + firstOffset;
    year = Math.floor(firstIndex / 12);
    month = firstIndex % 12;

    // El tope del bucle también debe recortarse al mes objetivo (targetLastIndex): de lo
    // contrario, frecuencias que dividen exacto el periodo (ej. Mensual) seguirían generando
    // visitas hasta la fecha de vencimiento real, ignorando el margen calculado arriba.
    const cutYear = Math.floor(targetLastIndex / 12);
    const cutMonth = targetLastIndex % 12;
    const cutDaysInMonth = new Date(cutYear, cutMonth + 1, 0).getDate();
    loopEnd = new Date(cutYear, cutMonth, Math.min(targetDay, cutDaysInMonth));
  }

  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let candidateDay = Math.min(targetDay, daysInMonth);
  let current = new Date(year, month, candidateDay);

  let safety = 0;
  while (current <= loopEnd && safety < 120) {
    safety++;
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateOnly = `${yyyy}-${mm}-${dd}`;
    const entry = (targetEquipment && targetEquipment !== 'all')
      ? `${dateOnly}|${targetEquipment}`
      : dateOnly;
    dates.push(entry);

    month += incrementMonths;
    if (month > 11) {
      year += Math.floor(month / 12);
      month = month % 12;
    }
    daysInMonth = new Date(year, month + 1, 0).getDate();
    candidateDay = Math.min(targetDay, daysInMonth);
    current = new Date(year, month, candidateDay);
  }
  return dates;
};

/**
 * Traduce una periodicidad de contrato (ej. "Cuatrimestral") al número de meses que representa,
 * como texto, para mostrar "cada X meses" en el cronograma impreso.
 *
 * "cuatrimestral" y "bimestral" contienen "mestral"/"trimestral" como subcadena, así que hay que
 * revisar las variantes más específicas antes que las genéricas -- si no, el .includes() de
 * "trimestral" haría match de forma incorrecta dentro de "cuatrimestral" (bug real que mostraba
 * "cada 3 meses" para contratos Cuatrimestrales).
 */
export const getPeriodicityMonths = (periodicity: string): string => {
  const val = (periodicity || 'CUATRIMESTRAL').toLowerCase();
  return val.includes('cuatrimestral') ? '4'
    : val.includes('bimestral') ? '2'
    : val.includes('trimestral') ? '3'
    : val.includes('semestral') ? '6'
    : val.includes('mensual') ? '1'
    : val.includes('anual') ? '12' : '4';
};
