import { User } from '../../../../api/api-types'

const appAssignerStyles: React.CSSProperties = {
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
}
const AdminUserAssignModal = ({ user }: {
 user: User,
}) => {
  return (
    <div style={{display: "flex", justifyContent: "center",}} className="admin-single-user-assign-apps"> 
      <div style={appAssignerStyles} className="app-assigner">
      </div>
    </div>
  )
}

export default AdminUserAssignModal;
