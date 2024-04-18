import { useOutletContext } from 'react-router-dom'
import PageContextRow from '../../../PageContextRow/PageContextRow'
import { UserContext } from '../../../ip-whitelist-tracker-types'
import { ColumnFilterEntry } from '../../../CommerceTable/FilterFunnelColumnPicker'
import { ServerInfoRow } from '../../../../api/api-types'
import useApi from '../../../../hooks/api-hook'
import IPTableHead from './IPTableHead'
import IPTableBody from './IPTableBody'
import CommerceTable from '../../../CommerceTable/CommerceTable'
import { useEffect, useState } from 'react'
import { Spinner, useDisclosure } from '@chakra-ui/react'

// Page that displays for route "/user/ip-table"
const IPTablePage = () => {
  const [user, logout]: UserContext = useOutletContext();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [serverInfoData, setServerInfoData] = useState<Array<ServerInfoRow>>([]);
  const api = useApi();

  useEffect(() => {
    const fetchData = async () => {
      const apiResponse = await api.ServerInfo.All({ user_uid: user.user_uid });
      setServerInfoData(apiResponse.all);
      setLoaded(true);
    };

    fetchData();
  }, [user]);

  // columns that appear when you click the sort funnel icon
  const filterableColumns: Array<ColumnFilterEntry<ServerInfoRow>> = [
    { column: "server_info_uid", displayName: "Server ID" }, 
    { column: "app_info_uid", displayName: "App ID"}, 
    { column: "destination_hostname", displayName: "Hostname"}, 
    { column: "destination_ip_address", displayName: "IP Address"}, 
    { column: "destination_port", displayName: "Port"},
    { column: "created_at", displayName: "Creation Timestamp"},
    { column: "modified_at", displayName: "Last Modified Timestamp"},
  ]
 
  return (
    <>
      <PageContextRow userContext={[user, logout]} hideBackButton title="Whitelisted IPs" /> 
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
          filterableColumns={filterableColumns}
          tableRowSource={serverInfoData}
          tableHead={<IPTableHead />}
          tableBodyBuilder={IPTableBody}
          csvExportNameFunc={() => `whitelist_tracker_ips_${user.user_id}_${new Date().toLocaleDateString()}`}
          csvExport
        />
      }
    </>
  )
}

export default IPTablePage
