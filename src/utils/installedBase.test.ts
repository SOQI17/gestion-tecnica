import { describe, it, expect } from 'vitest';
import { parseUSDate, splitClientNameAndAddress } from './installedBase';

describe('parseUSDate', () => {
  it('convierte M/D/YYYY (formato estadounidense) a YYYY-MM-DD', () => {
    expect(parseUSDate('3/21/2003')).toBe('2003-03-21');
    expect(parseUSDate('12/5/2010')).toBe('2010-12-05');
  });

  it('deja pasar fechas ya en formato ISO', () => {
    expect(parseUSDate('2026-01-15')).toBe('2026-01-15');
  });

  it('devuelve undefined para entradas vacías o irreconocibles', () => {
    expect(parseUSDate('')).toBeUndefined();
    expect(parseUSDate('fecha invalida')).toBeUndefined();
  });
});

describe('splitClientNameAndAddress', () => {
  it('separa nombre y dirección cuando vienen unidos por coma', () => {
    const result = splitClientNameAndAddress('Clinica Bermudez, 0, Av 3 De Julio,178 Y San Miguel, Santo Domingo');
    expect(result.name).toBe('Clinica Bermudez');
    expect(result.addressHint).toBe('0, Av 3 De Julio,178 Y San Miguel, Santo Domingo');
  });

  it('usa el texto completo como nombre cuando no hay coma', () => {
    const result = splitClientNameAndAddress('CLINICA SAN MARCOS');
    expect(result.name).toBe('CLINICA SAN MARCOS');
    expect(result.addressHint).toBeUndefined();
  });

  it('quita prefijos de puntuación sueltos (ej. ".:")', () => {
    const result = splitClientNameAndAddress('.:Hospital de Especialidades San Antonio de Padua');
    expect(result.name).toBe('Hospital de Especialidades San Antonio de Padua');
  });
});
