import { ServerInfoRow } from '../../../api/api-types'
import { Td, Tr } from '@chakra-ui/react'

export const AdminServerInfosTableBody = (row: ServerInfoRow, index: number) => {
  return (
    <Tr className="commerce-table-row" key={index}>
      <Td>{row.server_info_uid}</Td>
      <Td>{row.app_info_uid}</Td>
      <Td>{row.destination_hostname}</Td>
      <Td>{row.destination_ip_address}</Td>
      <Td>{row.destination_port}</Td>
    </Tr>
  )
}   
