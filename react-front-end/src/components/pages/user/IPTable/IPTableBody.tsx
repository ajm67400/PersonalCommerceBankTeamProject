import { Tr, Td, Skeleton } from "@chakra-ui/react"
import IPRowDeleteButton from "./IPRowDeleteButton"
import IPRowDetailsButton from "./IPRowDetailsButton"
import IPRowEditButton from "./IPRowEditButton"
import { ApplicationInfoRow, ServerInfoRow } from "../../../../api/api-types"
import { useEffect, useState } from "react"
import { User } from "../../../../api/api-types"
import useApi from "../../../../hooks/api-hook"

// not a react component. used in .map in CommerceTable component
function IPTableBody(row: ServerInfoRow, index: number, user?: User): React.JSX.Element {
  return (
    <Tr className="commerce-table-row" key={index}>
        <Td>{row.server_info_uid}</Td>
        <Td>{(row as any).app_info_description}</Td>
        <Td>{row.destination_hostname}</Td>
        <Td>{row.destination_ip_address}</Td>
        <Td>{row.destination_port}</Td>
        <Td className="row-action">
            <IPRowDetailsButton serverId={row.server_info_uid} />
        </Td>
        <Td className="row-action">
            <IPRowEditButton serverId={row.server_info_uid} />
        </Td>
        <Td className="row-action">
            <IPRowDeleteButton serverId={row.server_info_uid} />
        </Td>
    </Tr>
  )
}

export default IPTableBody
