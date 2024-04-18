import { useNavigate } from "react-router-dom";
import { Role } from "../components/ip-whitelist-tracker-types";

const useHardRouteUpdate = (returnUrl: string, role: Role) => {
  const navigate = useNavigate();
  const updateRoute = role === "user" ? "/user" : "/admin";
  function forceUpdate(override?: string) {
    navigate(updateRoute)
    setTimeout(() => navigate(override || returnUrl), 10);
  }
  return forceUpdate;
}

export default useHardRouteUpdate;
