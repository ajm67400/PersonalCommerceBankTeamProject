import { useEffect, useState } from "react";
import { Api, ApplicationInfoRow, ServerInfoRow, UserAppsRow } from "../api/api-types";
import useUser from "./local-user-hook";
import useApi from "./api-hook";
import usePrivilege from "./user-privilege-hook";
import { useToast } from "@chakra-ui/react";
import { Role } from "../components/ip-whitelist-tracker-types";
import { User } from "../api/api-types";
import { error } from "console";

// re-useable hooks that act as api GET and POST using react state without manually having to make requests

function usePrivilegedApi(role: Role): [User?, Api?] {
  const allowed = usePrivilege([role]);
  if (!allowed) return [undefined, undefined];

  const [user, _, _2] = useUser();
  if (!user) return [undefined, undefined];

  const api = useApi();
  return [user, api];
}

export namespace useServerInfo {
  export function Single(serverInfoUid: number): [ServerInfoRow?, Function?, string?] {
    const [user, api] = usePrivilegedApi("user");
    if (!api || !user) return [undefined, undefined];
    
    const toast = useToast();
    const [serverInfo, setServerInfo] = useState<ServerInfoRow>();
    const [retrievedServerInfo, setRetrievedServerInfo] = useState<ServerInfoRow>();
    const [error, setError] = useState<string|undefined>(undefined);

    async function retrieveServerInfo() {
      const response = await api!.ServerInfo.Single({ 
        server_info_uid: serverInfoUid,
        user_uid: user!.user_uid,
      })
      if (response.error) {
        setError(response.error);
        return;
      }
      setRetrievedServerInfo(response.single);
      setServerInfo(response.single);
    }

    async function updateServerInfo() {
      const response = await api!.ServerInfo.Update({
        server_info_uid: serverInfoUid,
        user_uid: user!.user_uid,
        new_server_info: serverInfo!, 
      })
      if (response.error) {
        setError(response.error);
        return;
      }
      toast({
        title: "Server Info updated successfully",
        position: "top",
        status: "success",
        duration: 2000,
      })
    }

    useEffect(() => {
      if (!serverInfo) {
        (async () => await retrieveServerInfo())() 
      } else {
        if (serverInfo !== retrievedServerInfo) {
          (async () => await updateServerInfo())() 
        }
      }
    }, [api, serverInfo]);

    return [serverInfo, setServerInfo, error];
  }
}

// admin only
export namespace useUsers {
  export function Single(userUid: number): User|undefined {
    const [admin, api] = usePrivilegedApi("admin");
    if (!api || !admin) return undefined;

    const toast = useToast();
    const [user, setUser] = useState<User>();

    useEffect(() => {
      const fetchUser = async () => {
        const response = await api.User.Single({
          user_uid: userUid,
          requester_uid: admin.user_uid,
        })
        if (!response.user) {
          toast({ 
            title: `Could not fetch user with UID ${userUid}: ${response.error || "Unknown error"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
          return;
        }
        setUser(response.user);
      }
      (async () => await fetchUser())();
    }, [api])

    return user;
  }
}

// Admin only
export namespace useAppInfo {
  // Admin only
  export function Some(appInfoUids: Array<number>): Array<ApplicationInfoRow> {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return [];

    const toast = useToast();
    const appInfos: Array<ApplicationInfoRow> = [];

    for (const uid of appInfoUids) {
      api.ApplicationInfo.Single({
        app_info_uid: uid,
        requester_uid: user!.user_uid,
      }).then((response) => {
        if (!response.app_info) {
          toast({ 
            title: `Could not fetch app ID ${uid}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
        } else {
          appInfos.push(response.app_info);
        }
      })
    }

    return appInfos;
  }
  export function All(): Array<ApplicationInfoRow>|undefined {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return undefined;

    const [appInfos, setAppInfos] = useState<Array<ApplicationInfoRow>>([]);
    const toast = useToast();

    useEffect(() => {
      async function fetchAllApps() {
        const response = await api!.ApplicationInfo.All({
          requester_uid: user!.user_uid,
        })
        if (!response.all) {
          toast({ 
            title: `Failed to fetch apps: ${response.error || "Unknown error"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
          return;
        }
        setAppInfos(response.all);
      }
      (async () => await fetchAllApps())();
    }, [api, user])

    return appInfos;
  }
  export function Single(appInfoUid: number): ApplicationInfoRow|undefined {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return undefined;

    const [appInfo, setAppInfo] = useState<ApplicationInfoRow>();
    const toast = useToast();

    useEffect(() => {
      async function fetchAppInfo() {
        const response = await api!.ApplicationInfo.Single({ 
          app_info_uid: appInfoUid,
          requester_uid: user!.user_uid,
        })
        if (!response.app_info) {  
          toast({ 
            title: `Failed to fetch single appinfo ${appInfoUid}: ${response.error || "Unknown error"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
          return;
        }
        setAppInfo(response.app_info);
      }

      (async () => await fetchAppInfo())();
    }, [appInfoUid, user, api]) 

    return appInfo;
  }
}

// Admin only
export namespace useUserApps {
  // Admin only
  export function Delete(userUid: number, appUid: number) {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return undefined;

    function executeDelete() {
      async function doDelete() {
        const response = await api!.UserApps.Delete({ 
          user_uid: userUid, 
          app_uid: appUid, 
          requester_uid: user!.user_uid 
        }) 
        return response;
      }
      return (async () => await doDelete())();
    }

    return executeDelete;
  }
  export function Single(userUid: number, appUid: number) {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return undefined;

    const [userApp, setUserApp] = useState<UserAppsRow>();
    const toast = useToast();

    useEffect(() => {
      async function fetchUserApp() {
        const response = await api!.UserApps.Single({ 
          user_uid: userUid, 
          app_uid: appUid, 
          requester_uid: user!.user_uid,
        })
        if (!response.user_app) {  
          toast({ 
            title: `Failed to fetch single app ${appUid} for user ${userUid}: ${response.error || "Unknown error"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
          return;
        }
        setUserApp(response.user_app);
      }

      (async () => await fetchUserApp())();
    }, [userUid, user, api])

    return userApp;
  }
  
  export function All(userUid: number): Array<UserAppsRow> {
    const [user, api] = usePrivilegedApi("admin");
    if (!api || !user) return [];

    const [userApps, setUserApps] = useState<Array<UserAppsRow>>();
    const toast = useToast();

    useEffect(() => {
      const fetchUserApps = async () => {
        const response = await api.UserApps.All({ 
          user_uid: userUid,
          requester_uid: user.user_uid,
        })
        if (!response.all) {
          toast({ 
            title: `Failed to fetch user apps for User UID ${userUid}: ${response.error || "Unknown error"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
          })
          return;
        }
        setUserApps(response.all);
      }
      (async () => await fetchUserApps())();
    }, [user, api])

    return userApps;
  }
}
