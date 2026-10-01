import { RoleTemplates, UserPermissions, Specialty } from '../types';

// Extraído de AdminPortal.tsx para que App.tsx pueda usar getDefaultPermissionsForSpecialty sin
// forzar la carga estática de todo el componente AdminPortal (que así puede cargarse de forma
// perezosa con React.lazy, reduciendo el bundle inicial para ingenieros/vendedores).
export const DEFAULT_GLOBAL_ROLE_TEMPLATES: RoleTemplates = {
  Ventas: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: false,
    canChangeWorkOrderStatus: false,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: false,
    canViewContractValues: true,

    canViewReports: true,
    canCreateReports: false,
    canApproveReports: false,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: false,

    canViewVacations: false,
    canManageVacations: false,

    canViewTrainings: false,
    canManageTrainings: false,

    canManageUsers: false,
    canViewAuditLogs: false,
    canExportData: true
  },
  Ingeniería: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: false,
    canChangeWorkOrderStatus: true,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: false,
    canViewContractValues: false,

    canViewReports: true,
    canCreateReports: true,
    canApproveReports: true,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: true,

    canViewVacations: true,
    canManageVacations: true,

    canViewTrainings: true,
    canManageTrainings: true,

    canManageUsers: false,
    canViewAuditLogs: true,
    canExportData: true
  },
  Admin: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: true,
    canChangeWorkOrderStatus: true,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: true,
    canViewContractValues: true,

    canViewReports: true,
    canCreateReports: true,
    canApproveReports: true,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: true,

    canViewVacations: true,
    canManageVacations: true,

    canViewTrainings: true,
    canManageTrainings: true,

    canManageUsers: true,
    canViewAuditLogs: true,
    canExportData: true
  }
};

export const getDefaultPermissionsForSpecialty = (specialty: Specialty | 'Admin', customTemplates?: RoleTemplates): UserPermissions => {
  const templates = customTemplates || DEFAULT_GLOBAL_ROLE_TEMPLATES;
  if (specialty === 'Ventas') {
    return templates.Ventas;
  } else if (specialty === 'Ingeniería' || specialty === 'Aplicaciones' || specialty === 'IT') {
    return templates.Ingeniería;
  }
  return templates.Admin;
};
