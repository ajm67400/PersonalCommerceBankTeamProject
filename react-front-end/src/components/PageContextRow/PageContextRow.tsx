import { Button } from '@chakra-ui/react';
import UserContextElement from './UserContextElement';
import { UserContext } from '../ip-whitelist-tracker-types';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';

const PageContextRow = ({ userContext, title, showUserInfo, style, backLocation, hideBackButton }: {
	userContext: UserContext,
	title: string | React.JSX.Element,
	showUserInfo?: boolean,
	style?: React.CSSProperties,
	backLocation?: string,
	hideBackButton?: boolean,
}) => { 
  const navigate = useNavigate();
  const [user, logout] = userContext;
  const containerStyle = {
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: "2em 4em",
  };
  const additionalContainerStyle = style ? { ...style, ...containerStyle } : containerStyle;
  //console.log(additionalContainerStyle)
  return (
	<div style={{paddingBottom: "1em"}} className="context-container">
	  <div 
	    style={additionalContainerStyle}
	    className="top-context-row">
	    <div className="page-context">
	      <div style={{width: "170px", marginBottom: "1em"}} className="logo-container">
		<img style={{maxWidth: "100%", height: "auto"}} src="/commerce-bank-logo-2x.png" />
	      </div>
	      <h1 style={{fontSize: "3em", fontWeight: "bold"}}>{title}</h1>
	    </div>
	    <div className='user-context'>
		    <UserContextElement user={user} hide={!showUserInfo} />
		    <Button 
			    onClick={logout}
			    colorScheme='red'
			    style={{marginTop: "5px"}}>
		      Logout
		    </Button>
	    </div>
	  </div>
	  {hideBackButton 
	  ? 
	    null
	  : 
	    <Button style={{marginLeft: "1.6em", backgroundColor: "white", color: "#006747", fontSize: "1.5em",}} onClick={() => navigate(backLocation || "/")}>
	     <ArrowBackIcon marginRight={"8px"} /> Back
	    </Button>
	  }
	</div>
  )
}

export default PageContextRow
