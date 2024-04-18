import { Td, Tr } from "@chakra-ui/react";
import { ApplicationInfoRow } from "../../../../../api/api-types";
import UserAppDeleteButton from "./UserAppDeleteButton";
import { User } from "../../../../../api/api-types";

// Not a react component
function AdminUserAppsTableBody(row: ApplicationInfoRow, index: number, user?: User, callback?: (data: Object) => void): React.JSX.Element { 
  return (
    <Tr className="commerce-table-row" key={index}>
        <Td>{row.app_info_description}</Td>
        <Td className="row-action">
            {user && <UserAppDeleteButton onDelete={callback} user={user} appInfo={row} />}
        </Td>
    </Tr>
  )
}

export default AdminUserAppsTableBody;
