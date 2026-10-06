import { describe, it, expect } from 'vitest';
import { normalizeClientName, findMatchingClient } from './clientMatching';

describe('normalizeClientName', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizeClientName('GAYATÁ S.A.')).toBe(normalizeClientName('gayata sa'));
  });

  it('quita sufijos legales comunes', () => {
    expect(normalizeClientName('HOSPITAL METROPOLITANO CIA LTDA')).toBe(normalizeClientName('HOSPITAL METROPOLITANO'));
  });

  it('quita nombres de ciudad pegados al nombre', () => {
    expect(normalizeClientName('CLINICA SANTA ANA - QUITO')).toBe(normalizeClientName('CLINICA SANTA ANA'));
  });

  it('devuelve cadena vacía para entradas vacías o nulas', () => {
    expect(normalizeClientName('')).toBe('');
    expect(normalizeClientName(undefined as unknown as string)).toBe('');
  });

  // Caso real: un nombre con tildes guardado alguna vez con codificación incorrecta queda con el
  // carácter de reemplazo Unicode "�" (U+FFFD) en vez de la letra original -- se quita (no se
  // reemplaza por espacio) para no partir la palabra en dos.
  it('quita el carácter de reemplazo Unicode "�" sin partir la palabra', () => {
    expect(normalizeClientName('Mar�a')).toBe('mara');
  });
});

describe('findMatchingClient', () => {
  const clients = [
    { id: 'CLI-1', name: 'GAYATA S.A.' },
    { id: 'CLI-2', name: 'Hospital Metropolitano' },
    { id: 'CLI-3', name: 'Clínica Santa Ana' }
  ];

  it('encuentra una coincidencia exacta tras normalizar', () => {
    const found = findMatchingClient('Gayata S.A.', clients);
    expect(found?.id).toBe('CLI-1');
  });

  it('encuentra por coincidencia de substring (nombre con sufijo distinto)', () => {
    const found = findMatchingClient('GAYATA', clients);
    expect(found?.id).toBe('CLI-1');
  });

  it('encuentra por similitud ante variaciones menores de ortografía', () => {
    const found = findMatchingClient('Hospital Metropolitan', clients);
    expect(found?.id).toBe('CLI-2');
  });

  it('no fusiona dos clientes genuinamente distintos', () => {
    const found = findMatchingClient('Farmacia San Juan', clients);
    expect(found).toBeUndefined();
  });

  it('devuelve undefined para un nombre vacío', () => {
    expect(findMatchingClient('', clients)).toBeUndefined();
  });
});
