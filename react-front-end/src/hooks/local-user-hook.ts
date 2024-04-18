import { useEffect, useState } from "react";
import { User } from "../api/api-types"; 
import { GetUser, SetUserFunc, LogoutUserFunc } from "../components/ip-whitelist-tracker-types";

// API for accessing user data stored in localStorage

const LOCAL_USER_KEY = "user";


const useUser = (): [GetUser, SetUserFunc, LogoutUserFunc] => {
  const [localUser, setLocalUser] = useState<User | null>(() => {
    const currentLocalUser = localStorage.getItem(LOCAL_USER_KEY);
    if (!currentLocalUser) return null;
    return JSON.parse(currentLocalUser) as User;
  });

  useEffect(() => {
    if (!localUser) {
      localStorage.removeItem(LOCAL_USER_KEY)
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    }
  }, [localUser])

  const setUser = (u: User) => {
    setLocalUser(u);
  } 

  const logoutUser = () => {
    setLocalUser(null);
  }

  return [localUser, setUser, logoutUser];
}
export default useUser;
