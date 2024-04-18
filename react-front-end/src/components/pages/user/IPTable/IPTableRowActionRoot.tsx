import { useEffect, } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import PageContextRow from '../../../PageContextRow/PageContextRow';
import { UserContext } from '../../../ip-whitelist-tracker-types';
import IPTableRowSingleView from './IPTableRowSingleView';
import IPTableRowDeletionPage from './IPTableRowDeletionPage';

// Handles the path /user/ip-table/:serverId/*
// Where serverId is the id of the row and * is the action that will happen to the row, 
// * can be edit, details, delete


type RowAction = "view" | "edit" | "delete";   
const validRowActions: RowAction[] = ["view", "edit", "delete"];

const IPTableRowActionRoot = () => {
  const [user, logout]: UserContext = useOutletContext();
  const navigate = useNavigate();
  const params = useParams();

  const serverId = Number(params["serverId"]);
  const rowAction: RowAction = params["*"] as RowAction;

  if (!validRowActions.includes(rowAction) || isNaN(serverId)) {
    useEffect(() => navigate("/user/ip-table"), []);
    return null;
  }

  const IpRowActionComponent = (): React.JSX.Element => {
    switch (rowAction) {
      case "view":   return <IPTableRowSingleView   user={user} serverId={serverId} />
      case "edit":   return <IPTableRowSingleView   user={user} serverId={serverId} edit />
      case "delete": return <IPTableRowDeletionPage user={user} serverId={serverId} />
    }
  }
  
  return (
    <div className='ip-action-page'>
      <PageContextRow 
        userContext={[user, logout]} 
        style={{color: rowAction === "delete" ? "red" : "black"}}
        title={`${rowAction[0].toUpperCase() + rowAction.slice(1)} Server ID ${serverId}`} 
        backLocation='/user/ip-table'
      />
      <IpRowActionComponent />
    </div>
  );
}

export default IPTableRowActionRoot
