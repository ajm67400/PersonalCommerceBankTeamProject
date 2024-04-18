import { useNavigate, useOutletContext } from "react-router-dom";
import { UserContext } from "../../../ip-whitelist-tracker-types";
import PageContextRow from "../../../PageContextRow/PageContextRow";
import { Spinner, Tab, TabList, Tabs, Td, Tr, useToast } from "@chakra-ui/react";
import { AdminContext } from "../AdminRoot";
import { ApplicationInfoRow } from "../../../../api/api-types";
import { ColumnFilterEntry } from "../../../CommerceTable/FilterFunnelColumnPicker";
import { useAppInfo } from "../../../../hooks/api-user-hooks";
import AppsTableHead from "./AppsTableHead";
import AppsTableBody from "./AppsTableBody";
import CommerceTable from "../../../CommerceTable/CommerceTable";
import { useEffect, useState } from "react";
import useApi from "../../../../hooks/api-hook";
import useHardRouteUpdate from "../../../../hooks/components-hard-update";

// /admin/application-info
const AdminApplicationInfoPage = () => {
  const { userContext, tabRoutes }: AdminContext = useOutletContext();
  const [user, logout]: UserContext = userContext;
  const [loaded, setLoaded] = useState<boolean>(false);

  const api = useApi();
  const toast = useToast();
  const forceReload = useHardRouteUpdate("/admin/application-info", "admin");
  const apps = useAppInfo.All(); 

  useEffect(() => {
    if (apps && apps.length>0) setLoaded(true);
  }, [apps])

  const navigate = useNavigate();

  const filterableColumns: Array<ColumnFilterEntry<ApplicationInfoRow>> = [
    { column: "app_info_uid", displayName: "App ID" },
    { column: "app_info_description", displayName: "App Descriptor" },
  ]

  return (
    <div className="admin-apps">
      <PageContextRow userContext={[user, logout]} title="Applications" hideBackButton /> 
      <Tabs onChange={(i) => navigate(`${tabRoutes[i].url}`)} defaultIndex={1} margin={"0 3em"} isFitted={true}>
        <TabList>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Servers</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Applications</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}} >Users</Tab>
        </TabList>
      </Tabs>    
      <div className="admin-apps-table-container">
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
          contextUser={user}
          tableData={{ hooks: [api, toast, forceReload] }}
          filterableColumns={filterableColumns}
          tableRowSource={apps!}
          tableHead={<AppsTableHead admin={user} />}
          tableBodyBuilder={AppsTableBody}
          csvExport
        />
      }
      </div>
    </div>
  )
}

export default AdminApplicationInfoPage
