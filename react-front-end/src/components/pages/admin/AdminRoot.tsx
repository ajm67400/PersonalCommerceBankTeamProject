import { Outlet } from 'react-router-dom'
import useUser from '../../../hooks/local-user-hook';
import usePrivilege from '../../../hooks/user-privilege-hook'; 
import useAuthRedirect from '../../../hooks/local-user-auth-hook';
import ErrorPageNotFound from '../../error-pages/ErrorPageNotFound';
import { UserContext } from '../../ip-whitelist-tracker-types';

// intermediate route that applies admin privilege check to all sub-routes
type TabRoute = { index: number, url: string };
export type AdminContext = { userContext: UserContext, tabRoutes: Array<TabRoute> };
const AdminRoot = () => {
  const [user, _, logout] = useUser();
  const allowed = usePrivilege(["admin"])
  useAuthRedirect(user);

  if (!user) return null;
  if (!allowed) return <ErrorPageNotFound title="Forbidden" />
  
  const routes: Array<TabRoute> = [
    { index: 0, url: "/admin/ip-table" },
    { index: 1, url: "/admin/application-info" },
    { index: 2, url: "/admin/manage-users" },
  ]

  return (
    <Outlet context={{userContext: [user, logout], tabRoutes: routes}} /> 
  )
}

export default AdminRoot
