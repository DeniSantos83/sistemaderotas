export function getPermissions(profile) {
  if (!profile) return {};

  const { role } = profile;

  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isTecnico = role === "tecnico";

  return {
    isAdmin,
    isGestor,
    isTecnico,

    // USERS
    canViewUsers: isAdmin || isGestor,
    canCreateUsers: isAdmin,
    canEditUsers: isAdmin,
    canToggleUsers: isAdmin,

    // COLABORADORES
    canManageEmployees: isAdmin || isGestor,

    // EQUIPAMENTOS
    canManageEquipments: isAdmin || isGestor,

    // SETORES
    canManageSectors: isAdmin || isGestor,

    // ROTAS
    canManageRoutes: true,

    // REGISTROS
    canManageRecords: true,
  };
}