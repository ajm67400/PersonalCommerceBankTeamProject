import useUser from '../../../hooks/local-user-hook';
import usePrivilege from '../../../hooks/user-privilege-hook';
import useAuthRedirect from '../../../hooks/local-user-auth-hook';
import { Outlet } from 'react-router-dom';
import ErrorPageNotFound from '../../error-pages/ErrorPageNotFound';

// intermediate root that checks for user (only) privilege 
const UserRoot = () => {
  const [user, _, logout] = useUser();
  const allowed = usePrivilege(["user"])
  useAuthRedirect(user);

  if (!user) return null;
  if (!allowed) return <ErrorPageNotFound title="Forbidden" />
  
  return (
    <Outlet context={[user, logout]} /> 
  )
}

export default UserRoot
