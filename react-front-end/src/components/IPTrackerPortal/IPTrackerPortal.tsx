import "./styles.css" 
import useAuthRedirect from '../../hooks/local-user-auth-hook';
import useUser from '../../hooks/local-user-hook';
import PageContextRow from '../PageContextRow/PageContextRow';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// navigates users to the correct page
const IPTrackerPortal = () => {
  const [user, _, logoutUser] = useUser();
  useAuthRedirect(user);
  if (!user) return null;

  const navigate = useNavigate();
  useEffect(() => {
    if (user.user_role === "user") {
      navigate(`/user/ip-table`)
    } else if (user.user_role === "admin") {
      navigate(`/admin/application-info`)
    }

  }, [])

  return (
    <div className='ip-whitelist-tracker-home'>
      <PageContextRow 
        userContext={[user, logoutUser]} 
        title="IP Whitelist Tracker" 
        showUserInfo 
        hideBackButton
      />
    </div>
  )
}

export default IPTrackerPortal;
