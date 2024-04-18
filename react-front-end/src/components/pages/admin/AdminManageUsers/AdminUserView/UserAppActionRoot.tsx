import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { UserContext } from '../../../../ip-whitelist-tracker-types';
import PageContextRow from '../../../../PageContextRow/PageContextRow';
import { useEffect, useState } from 'react';
import UserAppDeletionPage from './UserAppDeletionPage';
import { useAppInfo, useUsers } from '../../../../../hooks/api-user-hooks';
import { ApplicationInfoRow, User } from '../../../../../api/api-types';
import { Spinner } from '@chakra-ui/react';

// /admin/manage-users/:userUid/apps/:appUid/*

export type UserAppManagementAction = "delete" | "edit"
const allowedManagementActions = ["delete"];

const UserAppActionRoot = () => {
  const [admin, _]: UserContext = useOutletContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [pageTitle, setPageTitle] = useState<string>("Loading...");
  const navigate = useNavigate();

  // url params
  const params = useParams();
  const appUid = Number(params["appUid"]);
  const userUid = Number(params["userUid"]); 
  const action = params["appAction"] as UserAppManagementAction;

  useEffect(() => {
    if (!action || !allowedManagementActions.includes(action)) {
      navigate(`/admin/manage-users/${userUid}/view`)
    }
  }, [action])


  const user: User|undefined = useUsers.Single(userUid);
  const appInfo: ApplicationInfoRow|undefined = useAppInfo.Single(appUid);
  useEffect(() => {
    if (appInfo && user && action) {
      switch (action) {
        case 'delete':
          setPageTitle(`Deleting app "${appInfo.app_info_description}" from ${user.user_id}`) 
          break;
        case 'edit':
          setPageTitle(`Editing app "${appInfo.app_info_description}" from ${user.user_id}`) 
          break;
      }
      setLoaded(true);
    }
  }, [appInfo, user])

  const UserAppActionComponent = ({ action, appInfo, user }: { 
    action: UserAppManagementAction,
    appInfo: ApplicationInfoRow,
    user: User,
  }) => {
    switch (action) {
    case "delete":
      return <UserAppDeletionPage appInfo={appInfo} user={user} />
    }
  }
  
  return (
    <div className="user-app-action-root">
      <PageContextRow
        userContext={[admin, _]}
        title={pageTitle}
        backLocation={`/admin/manage-users/${userUid}/view`}
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
        <UserAppActionComponent action={action} appInfo={appInfo!} user={user} />
      }
    </div>
  )
}

export default UserAppActionRoot; 
