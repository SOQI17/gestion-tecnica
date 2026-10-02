// Cruce entre el registro de Equipos (Equipment, con serialNumber/gon) y los equipos embebidos
// dentro de cada Contrato (ContractEquipmentItem, con serial/gon) -- hoy son dos listas paralelas
// sin conexión real entre sí. Se comparan por número de serie o GON, normalizados (sin
// mayúsculas/minúsculas ni símbolos), ya que es el identificador más confiable que comparten
// ambos lados.

import { Equipment, Contract, ContractEquipmentItem } from '../types';

function normalizeIdentifier(raw?: string): string {
  return (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

export interface MatchedContractRef {
  contractId: string;
  clientId: string;
  isActive: boolean;
}

/**
 * Para un equipo del registro de Equipos, busca si está cubierto por algún contrato (comparando
 * por serie o GON contra los equipos embebidos de cada contrato). Devuelve el primer contrato
 * activo que calce; si no hay ninguno activo, el primero que calce de cualquier estado.
 */
export function findContractForEquipment(equip: Equipment, contracts: Contract[]): MatchedContractRef | undefined {
  const serial = normalizeIdentifier(equip.serialNumber);
  const gon = normalizeIdentifier(equip.gon);
  if (!serial && !gon) return undefined;

  let fallback: MatchedContractRef | undefined;

  for (const con of contracts) {
    if (con.deleted) continue;
    for (const item of con.equipmentItems || []) {
      const itemSerial = normalizeIdentifier(item.serial);
      const itemGon = normalizeIdentifier(item.gon);
      const matches = (!!serial && !!itemSerial && itemSerial === serial) || (!!gon && !!itemGon && itemGon === gon);
      if (!matches) continue;

      const ref: MatchedContractRef = { contractId: con.id, clientId: con.clientId, isActive: con.status === 'Activo' };
      if (ref.isActive) return ref;
      if (!fallback) fallback = ref;
    }
  }
  return fallback;
}

/**
 * Para un equipo embebido en un contrato, busca si ya existe como registro en el módulo Equipos
 * (comparando por serie o GON).
 */
export function findEquipmentForContractItem(item: ContractEquipmentItem, equipments: Equipment[]): Equipment | undefined {
  const serial = normalizeIdentifier(item.serial);
  const gon = normalizeIdentifier(item.gon);
  if (!serial && !gon) return undefined;

  return equipments.find(eq => {
    const eqSerial = normalizeIdentifier(eq.serialNumber);
    const eqGon = normalizeIdentifier(eq.gon);
    return (!!serial && !!eqSerial && eqSerial === serial) || (!!gon && !!eqGon && eqGon === gon);
  });
}
