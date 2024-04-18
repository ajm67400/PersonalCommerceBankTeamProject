import { useNavigate, useOutletContext } from "react-router-dom";
import { AdminContext } from "./AdminRoot";
import { UserContext } from "../../ip-whitelist-tracker-types";
import { ColumnFilterEntry } from "../../CommerceTable/FilterFunnelColumnPicker";
import { Spinner, Tab, TabList, Tabs, useToast } from "@chakra-ui/react";
import PageContextRow from "../../PageContextRow/PageContextRow";
import { useEffect, useState } from "react";
import { ServerInfoRow } from "../../../api/api-types";
import useApi from "../../../hooks/api-hook";
import CommerceTable from "../../CommerceTable/CommerceTable";
import AdminServerInfosTableHead from "./AdminServerInfosTableHead";
import { AdminServerInfosTableBody } from "./AdminServerInfosTableBody";

const AdminServerInfosPage = () => {
  const { userContext, tabRoutes }: AdminContext = useOutletContext();
  const [user, logout]: UserContext = userContext;
  const [loaded, setLoaded] = useState<boolean>(false);
  const [serverInfos, setServerInfos] = useState<Array<ServerInfoRow>>([]);

  const api = useApi();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api.ServerInfo.All({})
    .then(response => {
      if (!response.all) {
        toast({
          title: `Unable to fetch all server infos: ${response.error || "Unknown error"}`,
          status: "error",
          position: "top",
          duration: 5000,
        })
      } else {
        setServerInfos(response.all);
        setLoaded(true);
      }
    })
  }, [])

  const filterableColumns: Array<ColumnFilterEntry<ServerInfoRow>> = [
    { column: "server_info_uid", displayName: "Server ID" }, 
    { column: "app_info_uid", displayName: "App ID"}, 
    { column: "destination_hostname", displayName: "Hostname"}, 
    { column: "destination_ip_address", displayName: "IP Address"}, 
    { column: "destination_port", displayName: "Port"},
    { column: "created_at", displayName: "Creation Timestamp"},
    { column: "modified_at", displayName: "Last Modified Timestamp"},
  ]

  console.log(serverInfos)

  return (
    <>
      <PageContextRow userContext={[user, logout]} title="Servers" hideBackButton /> 
      <Tabs onChange={(i) => navigate(`${tabRoutes[i].url}`)} defaultIndex={0} margin={"0 3em"} isFitted={true}>
        <TabList>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Servers</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}}>Applications</Tab>
          <Tab _selected={{borderBottom: "5px solid #4fa800"}} >Users</Tab>
        </TabList>
      </Tabs>    

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
          tableRowSource={serverInfos}
          tableHead={<AdminServerInfosTableHead />}
          tableBodyBuilder={AdminServerInfosTableBody}
          csvExport
        />
      }
    </>
  )
}

export default AdminServerInfosPage
