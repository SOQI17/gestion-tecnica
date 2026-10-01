import { describe, it, expect } from 'vitest';
import { getDefaultPermissionsForSpecialty, DEFAULT_GLOBAL_ROLE_TEMPLATES } from './permissions';

describe('getDefaultPermissionsForSpecialty', () => {
  it('asigna la plantilla de Ventas para la especialidad Ventas', () => {
    const perms = getDefaultPermissionsForSpecialty('Ventas');
    expect(perms).toBe(DEFAULT_GLOBAL_ROLE_TEMPLATES.Ventas);
    expect(perms.canChangeWorkOrderStatus).toBe(false);
    expect(perms.canDeleteWorkOrders).toBe(false);
  });

  it('asigna la plantilla de Ingeniería para Ingeniería, Aplicaciones e IT', () => {
    expect(getDefaultPermissionsForSpecialty('Ingeniería')).toBe(DEFAULT_GLOBAL_ROLE_TEMPLATES.Ingeniería);
    expect(getDefaultPermissionsForSpecialty('Aplicaciones')).toBe(DEFAULT_GLOBAL_ROLE_TEMPLATES.Ingeniería);
    expect(getDefaultPermissionsForSpecialty('IT')).toBe(DEFAULT_GLOBAL_ROLE_TEMPLATES.Ingeniería);
  });

  it('cae a la plantilla de Admin para cualquier otra especialidad', () => {
    expect(getDefaultPermissionsForSpecialty('Admin' as any)).toBe(DEFAULT_GLOBAL_ROLE_TEMPLATES.Admin);
  });

  it('respeta plantillas personalizadas cuando se proveen', () => {
    const customTemplates = {
      ...DEFAULT_GLOBAL_ROLE_TEMPLATES,
      Ventas: { ...DEFAULT_GLOBAL_ROLE_TEMPLATES.Ventas, canChangeWorkOrderStatus: true }
    };
    const perms = getDefaultPermissionsForSpecialty('Ventas', customTemplates);
    expect(perms.canChangeWorkOrderStatus).toBe(true);
  });
});
