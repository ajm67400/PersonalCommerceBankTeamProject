import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import PageContextRow from '../../../PageContextRow/PageContextRow';
import { UserContext } from '../../../ip-whitelist-tracker-types';
import { useEffect, useState } from 'react';
import { UserAppsRow } from '../../../../api/api-types';
import { Skeleton, Spinner, } from '@chakra-ui/react';
import AdminUserView from './AdminUserView';
import { useUserApps, useUsers } from '../../../../hooks/api-user-hooks';

export type UserManagementAction = "view" | "delete" | "assign";
const allowedActions: Array<UserManagementAction> = ["view", "delete", "assign"];

const UserSettingsActionRoot = () => {
  const { userContext, tabRoutes } = useOutletContext();
  const [admin, logout]: UserContext = userContext;
  const [loaded, setLoaded] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>('');

  const navigate = useNavigate();
  const params = useParams();
  const userUid = Number(params["userUid"]);
  const action = params["userManagementAction"] as UserManagementAction;

  const userWeAreViewing = useUsers.Single(userUid);
  const userApps: Array<UserAppsRow> = useUserApps.All(userUid);

  useEffect(() => {
    if (userApps && userWeAreViewing) {
      setPageTitle(`${userWeAreViewing.user_id}'s Assigned Apps`)
      setLoaded(true);
    }
  }, [userWeAreViewing, userApps])

  useEffect(() => {
    if (!allowedActions.includes(action)) {
      navigate(`/admin/manage-users/${userUid}/view`)
    }
  }, [action])

  return (
    <div className="admin-user-settings-page">
      <PageContextRow 
        userContext={[admin, logout]} 
        title={!pageTitle ? <Skeleton height="20px" width="500px" /> : pageTitle} 
        backLocation="/admin/manage-users"
      />
      {!loaded ? 
        <Spinner
          style={{position: "absolute", top: "30vh", left: "47vw", transform: "scale(3)"}}
          thickness='5px'
          speed='0.65s'
          emptyColor='gray.200'
          color='blue.500'
          size='xl'
        />
        : 
        <AdminUserView
          admin={admin}
          userToView={userWeAreViewing!}
          apps={userApps}
        />
      }
    </div>
  )
}

export default UserSettingsActionRoot
