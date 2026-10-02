// Lógica para "Dar de Baja" un contrato (cliente desistió / equipo descontinuado): encuentra las
// órdenes de trabajo futuras y aún no ejecutadas que pertenecen a ese contrato, para poder
// cancelarlas y que dejen de aparecer en Agendamiento. El historial de visitas ya realizadas NUNCA
// se toca.

import { WorkOrder, Contract } from '../types';

const NON_CANCELLABLE_STATUSES = new Set(['Realizado', 'Reportado', 'Conciliado']);

/**
 * Busca, entre todas las órdenes de trabajo, las que están pendientes/en proceso, programadas a
 * futuro (fecha >= hoy) y pertenecen al contrato dado. Usa `wo.contractId` cuando está presente
 * (órdenes generadas después de que ese campo empezó a guardarse); si no, cae a un criterio
 * heurístico: mismo cliente y, si el contrato tiene equipos específicos, el nombre del equipo de
 * la orden coincide (substring en cualquier dirección) con alguno de ellos.
 */
export function findPendingWorkOrdersForContract(
  contract: Contract,
  workOrders: WorkOrder[],
  todayStr: string = new Date().toISOString().slice(0, 10)
): WorkOrder[] {
  const eqNames = (contract.equipmentItems || [])
    .map(e => (e.name || '').trim().toLowerCase())
    .filter(Boolean);

  return workOrders.filter(wo => {
    if (wo.deleted) return false;
    if (NON_CANCELLABLE_STATUSES.has(wo.status)) return false;
    if (wo.plannedDate < todayStr) return false;

    if (wo.contractId) {
      return wo.contractId === contract.id;
    }

    if (wo.clientId !== contract.clientId) return false;
    if (eqNames.length === 0) return true;

    const woEq = (wo.equipmentName || '').trim().toLowerCase();
    if (!woEq) return false;
    return eqNames.some(eqName => woEq.includes(eqName) || eqName.includes(woEq));
  });
}
