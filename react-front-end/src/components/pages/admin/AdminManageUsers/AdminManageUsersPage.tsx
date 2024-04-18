import { useNavigate, useOutletContext } from 'react-router-dom';
import { UserContext } from '../../../ip-whitelist-tracker-types';
import PageContextRow from '../../../PageContextRow/PageContextRow';
import CommerceTable from '../../../CommerceTable/CommerceTable';
import AdminUsersTableHead from './AdminUsersTableHead';
import AdminUsersTableBody from './AdminUsersTableBody';
import { ColumnFilterEntry } from '../../../CommerceTable/FilterFunnelColumnPicker';
import { useState, useEffect } from 'react';
import useApi from '../../../../hooks/api-hook';
import { User } from '../../../../api/api-types';
import { Spinner, Tab, TabList, Tabs, useToast } from '@chakra-ui/react';
import { AdminContext } from '../AdminRoot';

// /admin/manage-users
const AdminManageUsersPage = () => {
  const { userContext, tabRoutes }: AdminContext = useOutletContext();
  const [user, logout]: UserContext = userContext;

  const [loaded, setLoaded] = useState<boolean>(false);
  const [usersData, setUsersData] = useState<Array<User>>([]);
  const navigate = useNavigate();
  const toast = useToast();
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      const apiResponse = await api.User.All({ requester_uid: user.user_uid });
      if (!apiResponse.all) {
        toast({ 
          title: `Failed to fetch users: ${apiResponse.error || "Unknown error"}`, 
          isClosable: false, 
          duration: 2000,
          status: "error",
          position: "top"
        })
        return;
      }
      setUsersData(apiResponse.all);
      setLoaded(true);
    };

    fetchData();
  }, [user, api]);

  // columns that appear when you click the sort funnel icon
  const filterableColumns: Array<ColumnFilterEntry<User>> = [
    { column: "user_uid", displayName: "User ID" }, 
    { column: "user_id", displayName: "Username"}, 
    { column: "user_role", displayName: "Role"}, 
  ]
  return (
    <>
      <PageContextRow userContext={[user, logout]} title="Users" hideBackButton /> 
      <Tabs onChange={(i) => navigate(`${tabRoutes[i].url}`)} defaultIndex={2} margin={"0 3em"} isFitted={true}>
        <TabList>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Servers</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Applications</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}} >Users</Tab>
        </TabList>
      </Tabs>    
      <div style={{margin: "0 4em"}} className="user-management-table">
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
        <CommerceTable 
          user={user} 
          filterableColumns={filterableColumns}
          tableRowSource={usersData}
          tableHead={<AdminUsersTableHead admin={user} />}
          tableBodyBuilder={AdminUsersTableBody}
          csvExportNameFunc={() => `whitelist_tracker_users_${new Date().toLocaleDateString()}`}
          csvExport
        />
      }
      </div>
    </>
  )
}

export default AdminManageUsersPage
