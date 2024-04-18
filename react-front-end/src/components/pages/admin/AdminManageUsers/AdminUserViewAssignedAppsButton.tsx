import { SettingsIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const style: React.CSSProperties = {
  backgroundColor: "gray",
  color: "white",
}
const AdminUserViewAssignedAppsButton = ({ userUid }: {
  userUid: number,
}) => {
  const navigate = useNavigate();
  const handleViewDetailsOfThisRow = () => {
    navigate(`/admin/manage-users/${userUid}/view`) 
  }
  return (
    <>
      <Button style={style} onClick={handleViewDetailsOfThisRow}>
        <SettingsIcon />
      </Button>
    </>
  )
}

export default AdminUserViewAssignedAppsButton
