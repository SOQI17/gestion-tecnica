import { describe, it, expect } from 'vitest';
import { generateMaintenanceDates, getPeriodicityMonths, generateMaintenanceDatesForContract } from './maintenanceSchedule';

describe('getPeriodicityMonths', () => {
  // Regresión directa del bug real: "cuatrimestral" contiene "mestral", que también aparece en
  // "trimestral" -- si se revisa "trimestral" antes que "cuatrimestral", un contrato Cuatrimestral
  // mostraba incorrectamente "cada 3 meses" en el cronograma impreso.
  it('distingue Cuatrimestral de Trimestral aunque "trimestral" sea substring', () => {
    expect(getPeriodicityMonths('Cuatrimestral')).toBe('4');
    expect(getPeriodicityMonths('CUATRIMESTRAL')).toBe('4');
    expect(getPeriodicityMonths('Trimestral')).toBe('3');
  });

  it('mapea el resto de periodicidades conocidas', () => {
    expect(getPeriodicityMonths('Mensual')).toBe('1');
    expect(getPeriodicityMonths('Bimestral')).toBe('2');
    expect(getPeriodicityMonths('Semestral')).toBe('6');
    expect(getPeriodicityMonths('Anual')).toBe('12');
  });

  it('usa Cuatrimestral como valor por defecto si no hay periodicidad', () => {
    expect(getPeriodicityMonths('')).toBe('4');
    expect(getPeriodicityMonths(undefined as unknown as string)).toBe('4');
  });
});

describe('generateMaintenanceDates', () => {
  it('devuelve vacío si falta algún dato requerido o la frecuencia es Ninguno/Personalizado', () => {
    expect(generateMaintenanceDates('', '2026-12-31', 'Trimestral', 'Garantía')).toEqual([]);
    expect(generateMaintenanceDates('2026-01-01', '2026-12-31', 'Ninguno', 'Garantía')).toEqual([]);
    expect(generateMaintenanceDates('2026-01-01', '2026-12-31', 'Personalizado', 'Garantía')).toEqual([]);
  });

  it('devuelve vacío si la fecha de inicio es posterior a la de fin', () => {
    expect(generateMaintenanceDates('2027-01-01', '2026-01-01', 'Trimestral', 'Garantía')).toEqual([]);
  });

  // Garantía de 12 meses (15/ene/2026 a 15/ene/2027) con frecuencia trimestral: la última visita
  // debe quedar ~1 mes antes del vencimiento (15/dic, no 15/ene) -- verificado contra la
  // implementación real, no contra el comentario del código fuente (que tenía los meses de
  // ejemplo desactualizados/incorrectos).
  it('modo AUTO: trimestral en una garantía de 12 meses deja la última visita 1 mes antes del vencimiento', () => {
    const dates = generateMaintenanceDates('2026-01-15', '2027-01-15', 'Trimestral', 'Garantía');
    const months = dates.map(d => Number(d.split('-')[1]));
    expect(months).toEqual([3, 6, 9, 12]);
  });

  it('modo AUTO: mensual genera una visita por cada mes dentro del periodo', () => {
    const dates = generateMaintenanceDates('2026-01-01', '2026-04-01', 'Mensual', 'Garantía');
    expect(dates.length).toBeGreaterThan(0);
    dates.forEach(d => expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  it('con mes preferido, ancla las visitas a ese mes del año', () => {
    const dates = generateMaintenanceDates('2026-01-01', '2027-12-31', 'Anual', 'Contrato', undefined, undefined, 6);
    dates.forEach(d => expect(Number(d.split('-')[1])).toBe(6));
  });

  it('agrega el sufijo de equipo cuando se especifica un equipo objetivo (no "all")', () => {
    const dates = generateMaintenanceDates('2026-01-01', '2026-06-01', 'Bimestral', 'Garantía', undefined, 'Arco en C');
    dates.forEach(d => expect(d).toContain('|Arco en C'));
  });

  it('no agrega sufijo de equipo cuando el objetivo es "all"', () => {
    const dates = generateMaintenanceDates('2026-01-01', '2026-06-01', 'Bimestral', 'Garantía', undefined, 'all');
    dates.forEach(d => expect(d).not.toContain('|'));
  });
});

describe('generateMaintenanceDatesForContract', () => {
  // Regresión directa del bug real: contrato con 3 equipos y frecuencia Semestral generaba solo
  // 2 fechas totales (repartidas round-robin), dejando al tercer equipo sin cronograma. Debe
  // generar una tanda COMPLETA por cada equipo: 3 equipos × 2 visitas = 6 fechas.
  it('con "Todos los Equipos" y varios equipos, genera una tanda completa por cada uno', () => {
    const equipos = [{ name: 'FDR Smart' }, { name: 'FDR Nano' }, { name: 'FDR Nano' }];
    const dates = generateMaintenanceDatesForContract(
      '2026-01-15', '2027-01-15', 'Semestral', 'Garantía', undefined, 'all', undefined, equipos
    );
    expect(dates).toHaveLength(6);
    expect(dates.filter(d => d.endsWith('|FDR Smart'))).toHaveLength(2);
    expect(dates.filter(d => d.endsWith('|FDR Nano'))).toHaveLength(4);
  });

  it('devuelve las fechas ordenadas cronológicamente al combinar varios equipos', () => {
    const equipos = [{ name: 'Equipo A' }, { name: 'Equipo B' }];
    const dates = generateMaintenanceDatesForContract(
      '2026-01-15', '2027-01-15', 'Semestral', 'Garantía', undefined, 'all', undefined, equipos
    );
    const sortedCopy = [...dates].sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));
    expect(dates).toEqual(sortedCopy);
  });

  it('sin equipos listados y "Todos", genera una sola tanda genérica sin etiqueta (comportamiento previo)', () => {
    const dates = generateMaintenanceDatesForContract(
      '2026-01-15', '2027-01-15', 'Semestral', 'Garantía', undefined, 'all', undefined, []
    );
    expect(dates).toHaveLength(2);
    dates.forEach(d => expect(d).not.toContain('|'));
  });

  it('con un equipo especifico seleccionado, genera solo la tanda de ese equipo', () => {
    const equipos = [{ name: 'FDR Smart' }, { name: 'FDR Nano' }];
    const dates = generateMaintenanceDatesForContract(
      '2026-01-15', '2027-01-15', 'Semestral', 'Garantía', undefined, 'FDR Nano', undefined, equipos
    );
    expect(dates).toHaveLength(2);
    dates.forEach(d => expect(d.endsWith('|FDR Nano')).toBe(true));
  });
});
