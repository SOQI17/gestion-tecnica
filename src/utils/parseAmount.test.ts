import { describe, it, expect } from 'vitest';
import { parseDollarAmount } from './parseAmount';

describe('parseDollarAmount', () => {
  // Regresión directa del bug real: facturas GE con "1.400"/"1.500" (mil cuatrocientos, mil
  // quinientos, formato latinoamericano sin coma) se guardaban como 1.4/1.5.
  it('interpreta un punto con exactamente 3 dígitos como separador de miles, no decimal', () => {
    expect(parseDollarAmount('1.400')).toBe(1400);
    expect(parseDollarAmount('1.500')).toBe(1500);
    expect(parseDollarAmount('25.000')).toBe(25000);
  });

  it('interpreta varios puntos como separadores de miles', () => {
    expect(parseDollarAmount('1.400.000')).toBe(1400000);
  });

  it('respeta un punto decimal normal (1 o 2 dígitos después)', () => {
    expect(parseDollarAmount('1400.5')).toBe(1400.5);
    expect(parseDollarAmount('1400.50')).toBe(1400.5);
  });

  it('formato estadounidense con coma de miles y punto decimal', () => {
    expect(parseDollarAmount('3,557.25')).toBe(3557.25);
    expect(parseDollarAmount('1,400.00')).toBe(1400);
  });

  it('formato latinoamericano con punto de miles y coma decimal', () => {
    expect(parseDollarAmount('3.557,25')).toBe(3557.25);
  });

  it('coma sola como separador decimal', () => {
    expect(parseDollarAmount('400,83')).toBe(400.83);
  });

  // Regresión: tipear "1,400" al estilo EEUU (coma de miles, sin decimales) en el formulario
  // manual se interpretaba como decimal ("1,400" -> 1.4), el mismo bug que con el punto pero al
  // revés -- dejaba el mismo problema de "1000 veces menos" que ya se había corregido para el punto.
  it('interpreta una coma con exactamente 3 dígitos como separador de miles, no decimal', () => {
    expect(parseDollarAmount('1,400')).toBe(1400);
    expect(parseDollarAmount('25,000')).toBe(25000);
  });

  it('interpreta varias comas como separadores de miles', () => {
    expect(parseDollarAmount('1,400,000')).toBe(1400000);
  });

  it('acepta números planos, con simbolo de dolar y espacios', () => {
    expect(parseDollarAmount('1400')).toBe(1400);
    expect(parseDollarAmount('$1400')).toBe(1400);
    expect(parseDollarAmount(' 1400 ')).toBe(1400);
    expect(parseDollarAmount(1400)).toBe(1400);
  });

  it('devuelve 0 para entradas vacías o inválidas', () => {
    expect(parseDollarAmount('')).toBe(0);
    expect(parseDollarAmount('abc')).toBe(0);
  });
});
