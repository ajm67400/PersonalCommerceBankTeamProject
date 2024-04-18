import { Role } from "../components/ip-whitelist-tracker-types";


export interface ServerInfoRow { 
  server_info_uid: number,
  app_info_uid: number,
  source_hostname: string,
  source_ip_address: string,
  destination_hostname: string,
  destination_ip_address: string,
  destination_port: string,
  ip_status: "active" | "inactive",
  created_at: string,
  created_by: string,
  modified_at: string,
  modified_by: string, 
}
export interface ApplicationInfoRow {
  app_info_uid: number,
  app_info_description: string,
  //created_at: string,
  //created_by: string, 
  //modified_at: string,
  //modified_by: string, 
}
export interface UserAppsRow {
  user_apps_uid: number,
  user_uid: number,
  app_info_uid: number,
  //created_at: string,
  //created_by: string, 
  //modified_at: string,
  //modified_by: string, 
}
export interface User {
  user_uid: number,
  user_id: string,
  user_role: Role,
  created_at?: string,
  created_by?: string, 
  modified_at?: string,
  modified_by?: string, 
}

export namespace ApiTypes {
  export namespace CSV {
    export interface Request<Row> {
      user_uid: number,
      rows?: Row[], // if table is filtered export the filter result not the whole table?
    }
    export interface Response {
      url?: string, // download link to csv 
      error?: string, // if failed to generate csv?
    }
  }
  export namespace Login {
    export interface Request {
      username: string,
      password: string,
    }
    export interface Response {
      error: string | null,
      user?: User, // you can leave out created at/by, modified at/by
    }
  }
  export namespace ServerInfo {
    export namespace Create {
      export interface Request {
        user_uid: number,
        server_info: Partial<ServerInfoRow>; // not expected to provide things like primary key, date created, etc.
      }
      export interface Response {
        error: string | null,
        created: boolean,
      }
    }
    export namespace Single {
      export interface Request {
        user_uid: number,
        server_info_uid: number,
      }
      export interface Response {
        single?: ServerInfoRow;
        error?: string,
      }
    }
    export namespace All {
      export interface Request {
        user_uid?: number, 
        // for possible pagination
        offset?: number,
        limit?: number
      }
      export interface Response {
        all: ServerInfoRow[],
        error?: string,
      }
    }
    export namespace Update {  
      export interface Request {
        user_uid: number,
        server_info_uid: number, 
        new_server_info: ServerInfoRow,
      }
      export interface Response {
        updated?: boolean,
        error: string | null,
      }
    }
    export namespace Delete {
      export interface Request {
        user_uid: number,
        server_info_uid: number, 
      }
      export interface Response {
        deleted?: boolean,
        error: string | null,
      }
    }
  }
  export namespace User {
    export namespace Create {
      export interface Request {
        id: string,
        password: string,
        role: Role,
        requester_uid: number, // only admin can create user, so this must be admin uid
      }
      export interface Response {
        user?: User;
        error?: string,
      }
    }
    export namespace Single {
      export interface Request {
        user_uid: number
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        user?: User,
        error?: string,
      }
    }
    export namespace All {
      export interface Request {
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        all?: Array<User>,
        error?: string,
      }
    }
    export namespace Update {
      export interface Request {
        user_uid: number,
        updated_user: User,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        updated_user?: User,
        error?: string,
      }
    }
    export namespace Delete {
      export interface Request {
        user_uid: number,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        deleted?: boolean;
        error?: string,
      }
    }
  }
  export namespace UserApps { 
    export namespace Create {
      export interface Request {
        app_info_uid: number,
        user_uid: number,
        app_description: string,
        requester_uid: number, // only admin can create user, so this must be admin uid
      }
      export interface Response {
        user_app?: UserAppsRow;
        error?: string,
      }
    }
    export namespace Single { // gets a single app of a certain uid from user 
      export interface Request {
        user_uid: number,
        app_uid: number,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        user_app?: UserAppsRow,
        error?: string,
      }
    }
    export namespace All { // gets all a user's apps
      export interface Request {
        user_uid: number,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        all?: Array<UserAppsRow>,
        error?: string,
      }
    }
    export namespace Update {
      export interface Request {
        user_uid: number,
        app_uid: number,
        updated_user_app: UserAppsRow,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        updated_user_app?: UserAppsRow,
        error?: string,
      }
    }
    export namespace Delete {
      export interface Request {
        user_uid: number,
        app_uid: number,
        requester_uid: number, // admin only
      }
      export interface Response {
        deleted?: boolean;
        error?: string,
      }
    }
  }
  
  export namespace ApplicationInfo {
    export namespace Create {
      export interface Request {
        description: string,
        requester_uid: number, // only admin can create user, so this must be admin uid
      }
      export interface Response {
        app_info?: ApplicationInfoRow;
        error?: string,
      }
    }
    export namespace Single { 
      export interface Request {
        app_info_uid: number,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        app_info?: ApplicationInfoRow,
        error?: string,
      }
    }
    export namespace All { // gets all a user's apps
      export interface Request {
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        all?: Array<ApplicationInfoRow>,
        error?: string,
      }
    }
    export namespace Update {
      export interface Request {
        app_uid: number,
        updated_app_info: ApplicationInfoRow,
        requester_uid: number, // can only be admin  
      }
      export interface Response {
        updated_app_info?: ApplicationInfoRow,
        error?: string,
      }
    }
    export namespace Delete {
      export interface Request {
        app_uid: number,
        requester_uid: number, // admin only
      }
      export interface Response {
        deleted?: boolean;
        error?: string,
      }
    }
  }
}

export interface Api {
  CSV: {
    // export CSV of a server info rows for a user
    Export<Row>(data: ApiTypes.CSV.Request<Row>): Promise<ApiTypes.CSV.Response>;
  }

  Account: {
    Login(data: ApiTypes.Login.Request): Promise<ApiTypes.Login.Response>;
  }

  ServerInfo: {
    // create a new server_info record 
    Create(data: ApiTypes.ServerInfo.Create.Request): Promise<ApiTypes.ServerInfo.Create.Response>; 

    // get a single server_info row when uid is known   
    Single(data: ApiTypes.ServerInfo.Single.Request): Promise<ApiTypes.ServerInfo.Single.Response>;

    // get all server_info records for the given user (for all user_apps) 
    All(data: ApiTypes.ServerInfo.All.Request): Promise<ApiTypes.ServerInfo.All.Response>;

    // update a single server_info record to the new server_info record (provided in ServerInfo.Update.Request)
    Update(data: ApiTypes.ServerInfo.Update.Request): Promise<ApiTypes.ServerInfo.Update.Response>;

    // delete a single server_info record
    Delete(data: ApiTypes.ServerInfo.Delete.Request): Promise<ApiTypes.ServerInfo.Delete.Response>; 
  }

  User: {
    Create(data: ApiTypes.User.Create.Request): Promise<ApiTypes.User.Create.Response>; 

    Single(data: ApiTypes.User.Single.Request): Promise<ApiTypes.User.Single.Response>;

    All(data: ApiTypes.User.All.Request): Promise<ApiTypes.User.All.Response>;

    Update(data: ApiTypes.User.Update.Request): Promise<ApiTypes.User.Update.Response>;

    Delete(data: ApiTypes.User.Delete.Request): Promise<ApiTypes.User.Delete.Response>;
  }


  UserApps: {
    Create(data: ApiTypes.UserApps.Create.Request): Promise<ApiTypes.UserApps.Create.Response>; 

    Single(data: ApiTypes.UserApps.Single.Request): Promise<ApiTypes.UserApps.Single.Response>;

    All(data: ApiTypes.UserApps.All.Request): Promise<ApiTypes.UserApps.All.Response>;

    Update(data: ApiTypes.UserApps.Update.Request): Promise<ApiTypes.UserApps.Update.Response>;

    Delete(data: ApiTypes.UserApps.Delete.Request): Promise<ApiTypes.UserApps.Delete.Response>;
  }

  ApplicationInfo: {
    Create(data: ApiTypes.ApplicationInfo.Create.Request): Promise<ApiTypes.ApplicationInfo.Create.Response>; 

    Single(data: ApiTypes.ApplicationInfo.Single.Request): Promise<ApiTypes.ApplicationInfo.Single.Response>;

    All(data: ApiTypes.ApplicationInfo.All.Request): Promise<ApiTypes.ApplicationInfo.All.Response>;

    Update(data: ApiTypes.ApplicationInfo.Update.Request): Promise<ApiTypes.ApplicationInfo.Update.Response>;

    Delete(data: ApiTypes.ApplicationInfo.Delete.Request): Promise<ApiTypes.ApplicationInfo.Delete.Response>;
  }
}
