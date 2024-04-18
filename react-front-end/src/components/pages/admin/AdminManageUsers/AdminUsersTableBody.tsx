import { Td, Tr } from "@chakra-ui/react"
import { User } from "../../../../api/api-types";
import AdminUserViewAssignedAppsButton from "./AdminUserViewAssignedAppsButton";

// Not a react component <></>
function AdminUsersTableBody(row: User, index: number): React.JSX.Element {
  return (
    <Tr className="commerce-table-row" key={index}>
        <Td>{row.user_uid}</Td>
        <Td>{row.user_id}</Td>
        <Td>{row.user_role}</Td>
        <Td className="row-action">
            <AdminUserViewAssignedAppsButton userUid={row.user_uid} />
        </Td>
    </Tr>
  )
}

export default AdminUsersTableBody;
