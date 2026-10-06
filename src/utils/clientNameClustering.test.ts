import { describe, it, expect } from 'vitest';
import { clusterClientNames } from './clientNameClustering';

describe('clusterClientNames', () => {
  // Caso real reportado: buscar "rafael" en facturas GE mostraba 5 variantes del mismo cliente.
  // "SAN RAFAEL MEDIC CIA. LTDA." queda aparte a propósito: su similitud con las otras 4 (~0.63)
  // está por debajo del umbral conservador -- podría ser una razón social distinta de la misma
  // clínica, y fusionar entidades legales distintas es más riesgoso que dejarlas separadas.
  it('agrupa las variantes de escritura claramente similares, sin forzar las que son ambiguas', () => {
    const names = [
      'SAN RAFAEL MEDIC CIA. LTDA.',
      'CLINICA SAN RAFAEL',
      'Clínica San Rafael',
      'Clônica San Rafael',
      'CLIN.SaN.RAFAEL'
    ];
    const clusters = clusterClientNames(names);
    expect(clusters).toHaveLength(2);
    const bigCluster = clusters.find(c => c.variants.length === 4)!;
    expect(bigCluster).toBeDefined();
    expect(bigCluster.variants).toEqual(expect.arrayContaining(['CLINICA SAN RAFAEL', 'Clínica San Rafael', 'Clônica San Rafael', 'CLIN.SaN.RAFAEL']));
    const soloCluster = clusters.find(c => c.variants.length === 1)!;
    expect(soloCluster.variants).toEqual(['SAN RAFAEL MEDIC CIA. LTDA.']);
  });

  it('mantiene clientes genuinamente distintos en clusters separados', () => {
    const names = ['CLINICA SAN RAFAEL', 'HOSPITAL METROPOLITANO', 'FARMACIA SAN JUAN'];
    const clusters = clusterClientNames(names);
    expect(clusters).toHaveLength(3);
  });

  it('prefiere el nombre de un Client ya registrado como canónico', () => {
    const names = ['CLIN.SaN.RAFAEL', 'Clínica San Rafael', 'CLINICA SAN RAFAEL'];
    const clusters = clusterClientNames(names, ['Clínica San Rafael']);
    expect(clusters[0].canonicalName).toBe('Clínica San Rafael');
  });

  it('sin un Client registrado, usa la variante más frecuente como canónico', () => {
    const names = ['CLIN.SaN.RAFAEL', 'Clínica San Rafael', 'Clínica San Rafael', 'Clínica San Rafael'];
    const clusters = clusterClientNames(names);
    expect(clusters[0].canonicalName).toBe('Clínica San Rafael');
  });

  it('ignora nombres vacíos y deduplica', () => {
    const clusters = clusterClientNames(['', '  ', 'Hospital Alianza', 'Hospital Alianza']);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].variants).toEqual(['Hospital Alianza']);
  });
});
