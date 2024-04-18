import { Th, Tr } from '@chakra-ui/react'

const AdminServerInfosTableHead = () => {
  return (
    <Tr className="admin-server-infos-table-head">
      <Th>Server ID</Th>
      <Th>App</Th>
      <Th>Hostname</Th>
      <Th>Address</Th>
      <Th>Port</Th>
    </Tr>
  )
}

export default AdminServerInfosTableHead
