import { getNextId, getUserByUid, mockAppInfos, mockServerInfos, mockUserApps, mockUsers } from "./mock-data";
import { Api, ApiTypes, ServerInfoRow, User, UserAppsRow } from "./api-types";

let databaseState = mockServerInfos;
let usersState = mockUsers;
let userAppsState = mockUserApps;
let appInfosState = mockAppInfos;

class MockApi implements Api {
  constructor() {
    console.log("!!! USING MOCK API")
    console.log(`!!! Current environment: ${process.env.NODE_ENV}`)
  }
  Account = {
    Login(data: ApiTypes.Login.Request): Promise<ApiTypes.Login.Response> {
      return new Promise((resolve, _) => {
        const user: User|undefined = usersState.find(u => u.user_id === data.username);
        if (!user) {
          resolve({      
            error: "User not found",
          })
          return;
        }
        // for mock API, we ignore password
        resolve({ error: null, user: user })
      }); 
    }
  }
  CSV = {
    // export CSV of a server info rows for a user
    Export<Row>(data: ApiTypes.CSV.Request<Row>): Promise<ApiTypes.CSV.Response> {
      return new Promise(async (resolve, _) => {
        if (!data.rows || data.rows.length === 0) {
          resolve({ error: "No rows to export" })
          return;
        }

        // NOTE: Might not need back-end route for generating CSV
        // This generates a real CSV of the IP table client side and works as expected
        const firstRow = data.rows[0] as Object;
        const csvHeading = Object.keys(firstRow).join(',') + '\n';
        const csvBody = data.rows.map((row: Row) => {
          return Object.values(row as Object).map(value => {
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',');
        }).join('\n');

        const csvContent = csvHeading + csvBody;
        const url = window.URL.createObjectURL(new Blob([csvContent]));

        resolve({
          url: url, 
        }) 
      })
    }
  }
  ServerInfo = {
    Create(data: ApiTypes.ServerInfo.Create.Request): Promise<ApiTypes.ServerInfo.Create.Response> {
      console.log(data.server_info.ip_status)
      const mockRecordToInsert: Partial<ServerInfoRow> = {
        server_info_uid: getNextId(databaseState, "server_info_uid") + 1, 
        ...data.server_info,
        created_at: new Date().toDateString(),
        created_by: getUserByUid(data.user_uid)!.user_id, 
        modified_at: new Date().toDateString(),
        modified_by: getUserByUid(data.user_uid)!.user_id,
      }
      databaseState = [...databaseState, mockRecordToInsert as ServerInfoRow]
      const success = databaseState.includes(mockRecordToInsert as ServerInfoRow);
      return new Promise((resolve, _) => {
        resolve({
          error: !success ? "Unable to add record to database (MOCK API)" : null,
          created: success,
        })
      })
    },
    All(data: ApiTypes.ServerInfo.All.Request): Promise<ApiTypes.ServerInfo.All.Response> {
      // get server_info rows from data.user_uid
      data.user_uid;
      return new Promise((resolve, _) => {
        resolve({
          all: databaseState, 
        })
      })
    },
    Single(data: ApiTypes.ServerInfo.Single.Request): Promise<ApiTypes.ServerInfo.Single.Response> {
      return new Promise((resolve, _) => {
        resolve({
          single: databaseState.find(s => s.server_info_uid === data.server_info_uid)
        })
      })
    },
    Update(data: ApiTypes.ServerInfo.Update.Request): Promise<ApiTypes.ServerInfo.Update.Response> {
      let error: string | null = null;
      const serverInfoIndex = databaseState.findIndex(s => s.server_info_uid === data.server_info_uid);
      if (serverInfoIndex !== -1) {
        databaseState[serverInfoIndex] = data.new_server_info;
        databaseState[serverInfoIndex].modified_at = new Date().toDateString();
        databaseState[serverInfoIndex].modified_by = getUserByUid(data.user_uid)!.user_id;
      } else {
        error = `Could not update server info with id ${data.server_info_uid}: id doesnt exist`;
      }

      if (databaseState[serverInfoIndex] !== data.new_server_info) {
        error = `Unable to update server info record (Mock API)`;
      }
 
      return new Promise((resolve, _) => {
        resolve({
          updated: error !== null, 
          error: error, 
        })
      })
    },
    Delete(data: ApiTypes.ServerInfo.Delete.Request): Promise<ApiTypes.ServerInfo.Delete.Response> { 
      let error: string | null = null;
      const serverInfoIndex = databaseState.findIndex(s => s.server_info_uid === data.server_info_uid);
      if (serverInfoIndex !== -1) {
        databaseState = databaseState.filter((_, i) => i != serverInfoIndex);
      } else {
        error = `Could not delete server info with id ${data.server_info_uid}: id doesnt exist`;
      }

      return new Promise((resolve, _) => {
        resolve({
          deleted: error !== null, 
          error: error, 
        })
      })
    },
  }


  User = {
    Create(data: ApiTypes.User.Create.Request): Promise<ApiTypes.User.Create.Response> {
      return new Promise(async (resolve, _) => {
        const request = await this.Single({ user_uid: data.requester_uid, requester_uid: data.requester_uid });
        if (request.error) {
          resolve({ error: request.error })
          return;
        }
        
        const requester = request.user;
        if (!requester || requester.user_role === "user") {
          resolve({ error: "Forbidden" })
          return;
        }
        
        const newUser: User = { user_uid: getNextId(usersState, "user_uid"), user_id: data.id, user_role: data.role };
        usersState = [...usersState, newUser];
        resolve({
          user: newUser, 
        })
      })
    },

    Single(data: ApiTypes.User.Single.Request): Promise<ApiTypes.User.Single.Response> {
      return new Promise((resolve, _) => {
        let error;
        const user: User|undefined = usersState.find(u => u.user_uid === data.user_uid);
        if (!user) {
          error = `User with id ${data.user_uid} doesn't exist`;
        }
        resolve({
          user: user,       
          error: error,
        })
      })
    },

    All(data: ApiTypes.User.All.Request): Promise<ApiTypes.User.All.Response> {
      return new Promise(async (resolve, _) => {
        const request = await this.Single({ user_uid: data.requester_uid, requester_uid: data.requester_uid });
        if (request.error) {
          resolve({ error: request.error })
          return;
        }
        
        const requester = request.user;
        if (!requester || requester.user_role !== "admin") {
          resolve({ error: "Forbidden" })
          return;
        }
        resolve({
          all: usersState,
        })
      })
    },

    Update(data: ApiTypes.User.Update.Request): Promise<ApiTypes.User.Update.Response> {
      return new Promise(async (resolve, _) => {
        const request = await this.Single({ user_uid: data.user_uid, requester_uid: data.requester_uid });
        if (!request.user) {
          resolve({ error: `User with id ${data.user_uid} doesn't exist` })
          return;
        }

        const userIndex = usersState.findIndex(u => u.user_uid === data.user_uid); 
        usersState[userIndex] = data.updated_user;

        resolve({
          updated_user: usersState[userIndex]
        })
      })
    },

    Delete(data: ApiTypes.User.Delete.Request): Promise<ApiTypes.User.Delete.Response> {
      return new Promise(async (resolve, _) => {
        const request = await this.Single({ user_uid: data.user_uid, requester_uid: data.requester_uid});
        if (!request.user) {
          resolve({ error: `User with id ${data.user_uid} doesn't exist` })
          return;
        }
        
        const userIndex = usersState.findIndex(u => u.user_uid === data.user_uid);
        usersState = usersState.filter((_, i) => i != userIndex);

        resolve({
          deleted: true,
        }) 
      })
    },
  }

  UserApps = {
    Create(data: ApiTypes.UserApps.Create.Request): Promise<ApiTypes.UserApps.Create.Response> {
      const newUserApp: UserAppsRow = {
        user_apps_uid: getNextId(userAppsState, "user_apps_uid"),
        app_info_uid: data.app_info_uid,
        user_uid: data.user_uid, 
      }
      userAppsState = [...userAppsState, newUserApp];

      return new Promise(async (resolve, _) => {
        resolve({
         user_app: newUserApp, 
        })  
      });
    },

    Single(data: ApiTypes.UserApps.Single.Request): Promise<ApiTypes.UserApps.Single.Response> {
      let error: string; 
      return new Promise(async (resolve, _) => {
        const requester = usersState.find(u => u.user_uid === data.requester_uid);
        if (!requester || requester.user_role !== "admin") {
          resolve({ error: "Forbidden" })
        }

        const userApp = userAppsState.find(ua => ua.user_uid === data.user_uid && ua.app_info_uid === data.app_uid);
        if (!userApp) {
          error = `Could not find app ${data.app_uid} under user ${data.user_uid}`
        }
        resolve({
          user_app: userApp,
          error: error,
        }) 
      });
    },

    All(data: ApiTypes.UserApps.All.Request): Promise<ApiTypes.UserApps.All.Response> {
      let error: string;
      return new Promise(async (resolve, _) => {
        const requester = usersState.find(u => u.user_uid === data.requester_uid);
        if (!requester || requester.user_role !== "admin") {
          resolve({ error: "Forbidden" })
        }
        
        const userAllApps = userAppsState.filter(ua => ua.user_uid === data.user_uid);
        if (!userAllApps || userAllApps.length === 0) {
          error = `Could not find any apps under user ID ${data.user_uid}`
        }

        resolve({
          all: userAllApps,
          error: error,
        })
      });
    },

    Update(data: ApiTypes.UserApps.Update.Request): Promise<ApiTypes.UserApps.Update.Response> {
      data;
      return new Promise(async (resolve, _) => {

        resolve; 
      });
    },

    Delete(data: ApiTypes.UserApps.Delete.Request): Promise<ApiTypes.UserApps.Delete.Response> {
      return new Promise(async (resolve, _) => {
        
        const index = userAppsState.findIndex(ua => ua.user_uid === data.user_uid && ua.app_info_uid === data.app_uid);
        if (index === -1) {
          resolve({
            error: `User app not found`
          })
          return;
        }
        userAppsState = userAppsState.filter((_, i) => i != index);

        resolve({
          deleted: true,
        }) 
      });
    },
  }

  ApplicationInfo = {
    Create(data: ApiTypes.ApplicationInfo.Create.Request): Promise<ApiTypes.ApplicationInfo.Create.Response> {
      data;
      return new Promise(async (resolve, _) => {

        resolve; 
      });
    },

    Single(data: ApiTypes.ApplicationInfo.Single.Request): Promise<ApiTypes.ApplicationInfo.Single.Response> {
      let error: string;
      return new Promise(async (resolve, _) => {
        const requester = usersState.find(u => u.user_uid === data.requester_uid);
        if (!requester || requester.user_role !== "admin") {
          resolve({ error: "Forbidden" })
        }

        const appInfo = appInfosState.find(a => a.app_info_uid === data.app_info_uid);
        if (!appInfo) {
          error = `No app exists with id "${data.app_info_uid}"`
        }

        resolve({
          app_info: appInfo,
          error: error,
        })
      });
    },

    All(data: ApiTypes.ApplicationInfo.All.Request): Promise<ApiTypes.ApplicationInfo.All.Response> {
      data;
      return new Promise(async (resolve, _) => {

        resolve; 
      });
    },

    Update(data: ApiTypes.ApplicationInfo.Update.Request): Promise<ApiTypes.ApplicationInfo.Update.Response> {
      data;
      return new Promise(async (resolve, _) => {

        resolve; 
      });
    },

    Delete(data: ApiTypes.ApplicationInfo.Delete.Request): Promise<ApiTypes.ApplicationInfo.Delete.Response> {
      data;
      return new Promise(async (resolve, _) => {
        resolve; 
      });
    },
  }
}

export default MockApi;
