import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";
import AtivarAcessoPage from "../features/auth/pages/AtivarAcessoPage";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";

import DashboardPage from "../features/dashboard/pages/DashboardPage";

import UsersListPage from "../features/users/pages/UsersListPage";
import UserCreatePage from "../features/users/pages/UserCreatePage";
import UserDetailsPage from "../features/users/pages/UserDetailsPage";
import UserEditPage from "../features/users/pages/UserEditPage";

import EmployeesListPage from "../features/employees/pages/EmployeesListPage";
import EmployeeCreatePage from "../features/employees/pages/EmployeeCreatePage";
import EmployeeDetailsPage from "../features/employees/pages/EmployeeDetailsPage";
import EmployeeEditPage from "../features/employees/pages/EmployeeEditPage";

import LocationsListPage from "../features/locations/pages/LocationsListPage";
import LocationCreatePage from "../features/locations/pages/LocationCreatePage";
import LocationDetailsPage from "../features/locations/pages/LocationDetailsPage";
import LocationEditPage from "../features/locations/pages/LocationEditPage";

import SectorsListPage from "../features/sectors/pages/SectorsListPage";
import SectorCreatePage from "../features/sectors/pages/SectorCreatePage";
import SectorDetailsPage from "../features/sectors/pages/SectorDetailsPage";
import SectorEditPage from "../features/sectors/pages/SectorEditPage";

import EquipmentsListPage from "../features/equipments/pages/EquipmentsListPage";
import EquipmentCreatePage from "../features/equipments/pages/EquipmentCreatePage";
import EquipmentDetailsPage from "../features/equipments/pages/EquipmentDetailsPage";
import EquipmentEditPage from "../features/equipments/pages/EquipmentEditPage";

import RecordsListPage from "../features/records/pages/RecordsListPage";
import RecordCreatePage from "../features/records/pages/RecordCreatePage";
import RecordDetailsPage from "../features/records/pages/RecordDetailsPage";
import RecordEditPage from "../features/records/pages/RecordEditPage";

import RoutesListPage from "../features/routes/pages/RoutesListPage";
import RouteCreatePage from "../features/routes/pages/RouteCreatePage";
import RouteDetailsPage from "../features/routes/pages/RouteDetailsPage";
import RouteEditPage from "../features/routes/pages/RouteEditPage";

import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import NotificationCreatePage from "../features/notifications/pages/NotificationCreatePage";
import NotificationEditPage from "../features/notifications/pages/NotificationEditPage";

import SettingsPage from "../features/settings/pages/SettingsPage";
import SettingCreatePage from "../features/settings/pages/SettingCreatePage";
import SettingEditPage from "../features/settings/pages/SettingEditPage";



export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/esqueci-senha", element: <ForgotPasswordPage /> },
      { path: "/redefinir-senha", element: <ResetPasswordPage /> },
      { path: "/ativar-acesso", element: <AtivarAcessoPage /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      { path: "dashboard", element: <DashboardPage /> },

      {  path: "/usuarios",  element: <ProtectedRoute><UsersListPage /></ProtectedRoute>,},
      {  path: "/usuarios/novo",  element: <ProtectedRoute><UserCreatePage /></ProtectedRoute>,},
      {  path: "/usuarios/:id",  element: <ProtectedRoute><UserDetailsPage /></ProtectedRoute>,},
      {  path: "/usuarios/:id/editar",  element: <ProtectedRoute><UserEditPage /></ProtectedRoute>,},

      { path: "colaboradores", element: <EmployeesListPage /> },
      { path: "colaboradores/novo", element: <EmployeeCreatePage /> },
      { path: "colaboradores/:id", element: <EmployeeDetailsPage /> },
      { path: "colaboradores/:id/editar", element: <EmployeeEditPage /> },

      { path: "locais", element: <LocationsListPage /> },
      { path: "locais/novo", element: <LocationCreatePage /> },
      { path: "locais/:id", element: <LocationDetailsPage /> },
      { path: "locais/:id/editar", element: <LocationEditPage /> },

      { path: "setores", element: <SectorsListPage /> },
      { path: "setores/novo", element: <SectorCreatePage /> },
      { path: "setores/:id", element: <SectorDetailsPage /> },
      { path: "setores/:id/editar", element: <SectorEditPage /> },

      { path: "equipamentos", element: <EquipmentsListPage /> },
      { path: "equipamentos/novo", element: <EquipmentCreatePage /> },
      { path: "equipamentos/:id", element: <EquipmentDetailsPage /> },
      { path: "equipamentos/:id/editar", element: <EquipmentEditPage /> },

      { path: "registros", element: <RecordsListPage /> },
      { path: "registros/novo", element: <RecordCreatePage /> },
      { path: "registros/:id", element: <RecordDetailsPage /> },
      { path: "registros/:id/editar", element: <RecordEditPage /> },

      { path: "rotas", element: <RoutesListPage /> },
      { path: "rotas/novo", element: <RouteCreatePage /> },
      { path: "rotas/:id", element: <RouteDetailsPage /> },
      { path: "rotas/:id/editar", element: <RouteEditPage /> },

      { path: "notificacoes", element: <NotificationsPage /> },
      { path: "notificacoes/nova", element: <NotificationCreatePage /> },
      { path: "notificacoes/:id/editar", element: <NotificationEditPage /> },

      { path: "configuracoes", element: <SettingsPage /> },
      { path: "configuracoes/nova", element: <SettingCreatePage /> },
      { path: "configuracoes/:id/editar", element: <SettingEditPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);