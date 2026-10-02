import { describe, it, expect } from 'vitest';
import { findContractForEquipment, findEquipmentForContractItem } from './equipmentContractMatch';
import type { Equipment, Contract } from '../types';

const baseEquip: Equipment = {
  id: 'EQ-1',
  name: 'AMX 4',
  clientId: 'CLI-1',
  brand: 'GENERAL ELECTRIC',
  model: 'AMX 4',
  serialNumber: '2269amx4',
  status: 'Operativo'
};

describe('findContractForEquipment', () => {
  it('encuentra el contrato que cubre el equipo por número de serie (sin importar mayúsculas)', () => {
    const contracts: Contract[] = [{
      id: 'CON-1',
      clientId: 'CLI-1',
      type: 'Facturable',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      status: 'Activo',
      equipmentItems: [{ name: 'AMX 4', brand: 'GE', serial: '2269AMX4' }]
    }];
    const found = findContractForEquipment(baseEquip, contracts);
    expect(found?.contractId).toBe('CON-1');
    expect(found?.isActive).toBe(true);
  });

  it('encuentra por GON cuando no hay coincidencia de serie', () => {
    const equip: Equipment = { ...baseEquip, serialNumber: '', gon: '2533401' };
    const contracts: Contract[] = [{
      id: 'CON-2',
      clientId: 'CLI-1',
      type: 'Facturable',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      status: 'Vencido',
      equipmentItems: [{ name: 'Workstation', brand: 'GE', gon: '2533401' }]
    }];
    const found = findContractForEquipment(equip, contracts);
    expect(found?.contractId).toBe('CON-2');
    expect(found?.isActive).toBe(false);
  });

  it('prefiere un contrato activo sobre uno vencido si ambos calzan', () => {
    const contracts: Contract[] = [
      {
        id: 'CON-OLD', clientId: 'CLI-1', type: 'Facturable', startDate: '2020-01-01', endDate: '2021-01-01',
        status: 'Vencido', equipmentItems: [{ name: 'AMX 4', brand: 'GE', serial: '2269AMX4' }]
      },
      {
        id: 'CON-NEW', clientId: 'CLI-1', type: 'Facturable', startDate: '2026-01-01', endDate: '2027-01-01',
        status: 'Activo', equipmentItems: [{ name: 'AMX 4', brand: 'GE', serial: '2269AMX4' }]
      }
    ];
    const found = findContractForEquipment(baseEquip, contracts);
    expect(found?.contractId).toBe('CON-NEW');
  });

  it('devuelve undefined si el equipo no tiene serie ni GON, o si no hay contrato que calce', () => {
    expect(findContractForEquipment({ ...baseEquip, serialNumber: '' }, [])).toBeUndefined();
    expect(findContractForEquipment(baseEquip, [{
      id: 'CON-3', clientId: 'CLI-1', type: 'Facturable', startDate: '2026-01-01', endDate: '2027-01-01',
      status: 'Activo', equipmentItems: [{ name: 'Otro equipo', brand: 'GE', serial: 'NO-MATCH' }]
    }])).toBeUndefined();
  });
});

describe('findEquipmentForContractItem', () => {
  it('encuentra el equipo ya registrado por serie', () => {
    const found = findEquipmentForContractItem({ name: 'AMX 4', brand: 'GE', serial: '2269AMX4' }, [baseEquip]);
    expect(found?.id).toBe('EQ-1');
  });

  it('devuelve undefined si el equipo del contrato no está en el registro', () => {
    const found = findEquipmentForContractItem({ name: 'Nuevo', brand: 'GE', serial: 'NO-EXISTE' }, [baseEquip]);
    expect(found).toBeUndefined();
  });
});
