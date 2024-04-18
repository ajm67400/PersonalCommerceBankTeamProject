import { useEffect, useState } from "react";
import useUser from "./local-user-hook";
import { Role } from "../components/ip-whitelist-tracker-types";
import { User } from "../api/api-types";

const usePrivilege = (allowedPrivileges: Role[]) => {
  const isUserAllowed = (user: User | null): boolean => {
    if (!user) return false;
    if (!allowedPrivileges) return false;
    const matchedPrivilege: Role | undefined = allowedPrivileges.find((p: Role) => p === user.user_role);
    return matchedPrivilege !== undefined;
  }

  const [user, _, _2] = useUser();
  const [allowed, setAllowed] = useState(isUserAllowed(user));

  useEffect(() => {
    setAllowed(isUserAllowed(user))
  }, [user]);

  return allowed;
}

export default usePrivilege;
