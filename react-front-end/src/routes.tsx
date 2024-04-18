import { createBrowserRouter } from "react-router-dom";
import ErrorPageNotFound from "./components/error-pages/ErrorPageNotFound";
import HomePage from "./components/IPTrackerPortal/HomePage/HomePage";
import AdminApplicationInfoPage from "./components/pages/admin/AdminApplicationInfo/AdminApplicationInfoPage";
import AdminManageUsersPage from "./components/pages/admin/AdminManageUsers/AdminManageUsersPage";
import AdminRoot from "./components/pages/admin/AdminRoot";
import UserRoot from "./components/pages/user/UserRoot";
import IPTablePage from "./components/pages/user/IPTable/IPTablePage";
import IPTableRowActionRoot from "./components/pages/user/IPTable/IPTableRowActionRoot";
import LoginPage from "./components/pages/login/LoginPage";
import IPTableRowAddPage from "./components/pages/user/IPTable/IPTableRowAddPage";
import UserSettingsActionRoot from "./components/pages/admin/AdminManageUsers/UserSettingsActionRoot";
import UserAppActionRoot from "./components/pages/admin/AdminManageUsers/AdminUserView/UserAppActionRoot";
import AdminServerInfosPage from "./components/pages/admin/AdminServerInfosPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
		errorElement: <ErrorPageNotFound />, 
	},
	{
		path: "login",
		element: <LoginPage />
	},
	{
		path: "user",
		element: <UserRoot />,
		children: [
			{
				path: "ip-table",
				element: <IPTablePage />,
			},
			{
				path: "ip-table/:serverId/*",
				element: <IPTableRowActionRoot />	
			},
			{
				path: "ip-table/add",
				element: <IPTableRowAddPage />
			},
		],
	},
	{
		path: "admin",
		element: <AdminRoot />,
		children: [
			{
				path: "application-info",
				element: <AdminApplicationInfoPage />
			},
			{
				path: "manage-users",
				element: <AdminManageUsersPage />
			},
			{
				path: "ip-table",
				element: <AdminServerInfosPage />
			},
			{
				path: "manage-users/:userUid/:userManagementAction",
				element: <UserSettingsActionRoot />,
			},
			{
				path: "manage-users/:userUid/apps/:appUid/:appAction",
				element: <UserAppActionRoot />
			},
		],
	},
]);


export default router;
