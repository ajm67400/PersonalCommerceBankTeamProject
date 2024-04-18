import useAuthRedirect from "../../../hooks/local-user-auth-hook";
import useUser from "../../../hooks/local-user-hook";
import IPTrackerPortal from "../IPTrackerPortal";

const HomePage = () => {
  const [user, _, _2] = useUser();
  useAuthRedirect(user);
  if (!user) return null;

  return <IPTrackerPortal />
}

export default HomePage
