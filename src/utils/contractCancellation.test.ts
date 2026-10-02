import { describe, it, expect } from 'vitest';
import { findPendingWorkOrdersForContract } from './contractCancellation';
import type { WorkOrder, Contract } from '../types';

const baseContract: Contract = {
  id: 'CON-1',
  clientId: 'CLI-1',
  type: 'Facturable',
  startDate: '2025-01-01',
  endDate: '2026-01-01',
  status: 'Activo',
  equipmentItems: [{ name: 'Revolution Maxima Power', brand: 'GE' }]
};

function makeWO(overrides: Partial<WorkOrder>): WorkOrder {
  return {
    id: 'WO-1',
    clientId: 'CLI-1',
    engineerId: '',
    plannedDate: '2026-06-01',
    type: 'Preventivo',
    status: 'Pendiente',
    equipmentName: 'Revolution Maxima Power',
    notes: '',
    ...overrides
  };
}

describe('findPendingWorkOrdersForContract', () => {
  const today = '2026-01-01';

  it('incluye una OT futura y pendiente que calza por contractId directo', () => {
    const wo = makeWO({ contractId: 'CON-1' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([wo]);
  });

  it('excluye una OT con contractId de OTRO contrato', () => {
    const wo = makeWO({ contractId: 'CON-OTRO' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([]);
  });

  it('sin contractId, calza por cliente + nombre de equipo (substring)', () => {
    const wo = makeWO({ equipmentName: 'Arco en C Revolution Maxima Power' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([wo]);
  });

  it('sin contractId, NO calza si el equipo no coincide con ninguno del contrato', () => {
    const wo = makeWO({ equipmentName: 'Mamografo Senographe' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([]);
  });

  it('sin contractId y sin equipos especificados en el contrato, calza solo por cliente', () => {
    const contractSinEquipos: Contract = { ...baseContract, equipmentItems: [] };
    const wo = makeWO({ equipmentName: 'Cualquier Cosa' });
    expect(findPendingWorkOrdersForContract(contractSinEquipos, [wo], today)).toEqual([wo]);
  });

  it('excluye OTs de otro cliente', () => {
    const wo = makeWO({ clientId: 'CLI-OTRO' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([]);
  });

  it('excluye OTs ya ejecutadas/reportadas/conciliadas (no toca el historial)', () => {
    const realizado = makeWO({ id: 'WO-R', status: 'Realizado', contractId: 'CON-1' });
    const reportado = makeWO({ id: 'WO-REP', status: 'Reportado', contractId: 'CON-1' });
    const conciliado = makeWO({ id: 'WO-C', status: 'Conciliado', contractId: 'CON-1' });
    expect(findPendingWorkOrdersForContract(baseContract, [realizado, reportado, conciliado], today)).toEqual([]);
  });

  it('excluye OTs con fecha pasada', () => {
    const wo = makeWO({ contractId: 'CON-1', plannedDate: '2025-06-01' });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([]);
  });

  it('excluye OTs ya eliminadas (soft-delete)', () => {
    const wo = makeWO({ contractId: 'CON-1', deleted: true });
    expect(findPendingWorkOrdersForContract(baseContract, [wo], today)).toEqual([]);
  });
});
