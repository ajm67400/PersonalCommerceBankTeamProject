import { HttpStatusCode } from "axios";
import { ApiTypes, ApplicationInfoRow, ServerInfoRow, User, UserAppsRow } from "./api-types";
import { AxiosResponse } from "axios";
import { Api } from "./api-types";
import defaultAxios from "./config";
import MockApi from "./mock-api";

type ResponseAdapter<T = any> = (r: T) => T;
function adaptResponse<T, R>(response: AxiosResponse<R>, adapter: ResponseAdapter<T>): T | Array<T> {
  const data = response.data as any;
  const isDataArray = Array.isArray(data);
  const makeSureArray: Array<any> = isDataArray ? data : [data]
  const adapted = makeSureArray.map(adapter);
  console.log(adapted)
  return adapted;
}

type ResponseCodeHandler<R, O> = { 
  code: HttpStatusCode, 
  handler: (response: AxiosResponse<R>) => O
}
function handleResponse<R, O>(response: AxiosResponse<R>, handlers: Array<ResponseCodeHandler<R, O>>, defaultResponse: Object): any {
  if (!response) return { error: `Response was empty` };
  if (handlers) {
    const handlerIndex = handlers.findIndex(h => h.code === response.status);
    if (handlerIndex !== -1) {
      const handler: ResponseCodeHandler<R, O> = handlers[handlerIndex];
      return handler.handler(response);
    }
  }
  return defaultResponse;
}

// Production API connected to spring java server
class SpringRestApi implements Api  {
  CSV = {
    // export CSV of a server info rows for a user
    Export<Row>(data: ApiTypes.CSV.Request<Row>): Promise<ApiTypes.CSV.Response> {
      // Not a fake export function. Mock api csv works for anything
      return new MockApi().CSV.Export<Row>(data);
    }
  }
  Account = { 
    Login(data: ApiTypes.Login.Request): Promise<ApiTypes.Login.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.post("/login", { userId: data.username, userPassword: data.password });
        if (response.data.error) {
          resolve({ error: response.data.error, })
          return;
        }
        resolve({
          user: response.data,
          error: null,
        })
        console.log(response.data);
      })
    }
  };
  ServerInfo = {
    Create(data: ApiTypes.ServerInfo.Create.Request): Promise<ApiTypes.ServerInfo.Create.Response> {
      return new Promise(async (resolve, _) => {
        // adapt 
        const app_uid = data.server_info.app_info_uid;
        const response = await defaultAxios.post(`/server-info?userUid=${data.user_uid}&appUid=${app_uid}`, { ...data.server_info })
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ServerInfo.Create.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ error: null, created: true, }) },
          { code: HttpStatusCode.Created,   handler: (_) => ({ error: null, created: true, }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to create server info for the app provided.", created: false, }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `User with UID ${data.user_uid} not found`, created: false, }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }));
      })
    },
    All_Admin(data: ApiTypes.ServerInfo.All.Request): Promise<ApiTypes.ServerInfo.All.Response> {
      return new Promise(async (resolve, _) => {
        // not secure
        const response = await defaultAxios.get(`/server-info/admin`); 
        response.data = response.data.map((d: any) => { 
          d.app_info_uid = d.application_info.app_info_description 
          delete d.application_info;
          return d;
        });
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ServerInfo.All.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ all: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ all: [], error: "You don't have permission to access this resource" }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },
    All(data: ApiTypes.ServerInfo.All.Request): Promise<ApiTypes.ServerInfo.All.Response> {
      if (!data.user_uid) { 
        return this.All_Admin(data);
      }
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/server-info?userUid=${data.user_uid}`);
        if (response.status === HttpStatusCode.Ok) {
          // TODO maybe display app info code instead of ID everywhere? 
          // adapt response to front end api
          response.data = response.data.map((r: any) => {
            const app_info_uid = r.application_info.app_info_uid;
            r.app_info_uid = app_info_uid;
            r.app_info_description = r.application_info.app_info_description;
            delete r.application_info;
            return r;
          })

          resolve({
            all: response.data,
          }) 
        }
        resolve({
          all: [],
          error: response.data.error || "Unknown error",
        })
      })
    },
    Single(data: ApiTypes.ServerInfo.Single.Request): Promise<ApiTypes.ServerInfo.Single.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/server-info/${data.server_info_uid}?userUid=${data.user_uid}`);
        if (response.status === HttpStatusCode.NotFound) {
          resolve({
            error: response.data.error || "Unknown error", 
          })
          return;
        }
        // adapt response to front end api
        const app_info_uid = response.data.application_info.app_info_uid;
        delete response.data.application_info; // remove application_info key
        response.data.app_info_uid = app_info_uid;
        resolve({
          single: response.data as ServerInfoRow,
        })
      })
    },
    Update(data: ApiTypes.ServerInfo.Update.Request): Promise<ApiTypes.ServerInfo.Update.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.put(`/server-info/${data.server_info_uid}?userUid=${data.user_uid}`, data.new_server_info)
        if (response.status === HttpStatusCode.NotFound) {
          resolve({
            error: `No serverinfo with ID ${data.server_info_uid} exists`
          })
          return;
        }
        resolve({
          updated: true,
          error: null,
        })
      })
    },
    Delete(data: ApiTypes.ServerInfo.Delete.Request): Promise<ApiTypes.ServerInfo.Delete.Response> { 
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.delete(`/server-info/${data.server_info_uid}`);
        if (response.status === HttpStatusCode.NotFound) {
          resolve({
            error: `Server info with id ${data.server_info_uid} doesn't exist or you don't have permission`,
          })
          return; 
        }
        resolve({
          deleted: true,
          error: null,
        })
      })
    },
  };
  User = {
    Create(data: ApiTypes.User.Create.Request): Promise<ApiTypes.User.Create.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.post(`/users?requesterUid=${data.requester_uid}`, { user_id: data.id, user_password: data.password, user_role: data.role, });
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.User.Create.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ user: response.data }) },
          { code: HttpStatusCode.Created,   handler: (_) => ({ user: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.Found,  handler: (_) => ({ error: `User with username "${data.id}" already exists. Please choose a different name.` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Single(data: ApiTypes.User.Single.Request): Promise<ApiTypes.User.Single.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/users/${data.user_uid}?requesterUid=${data.requester_uid}`);
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.User.Single.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ user: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `User with uid ${data.user_uid} not found` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    All(data: ApiTypes.User.All.Request): Promise<ApiTypes.User.All.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/users?requesterUid=${data.requester_uid}`);
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.User.All.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ all: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `Users not found` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Update(data: ApiTypes.User.Update.Request): Promise<ApiTypes.User.Update.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.put(`/users/${data.user_uid}?requesterUid=${data.requester_uid}`, { ...data.updated_user })
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.User.Update.Response>> = [
          { code: HttpStatusCode.Ok,          handler: (_) => ({ updated_user: response.data, }) },
          { code: HttpStatusCode.Forbidden,   handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,    handler: (_) => ({ error: `User with UID ${data.user_uid} doesn't exist` }) },
          { code: HttpStatusCode.Found,       handler: (_) => ({ error: `User with ID "${data.updated_user.user_id}" already exists. Username not updated` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Delete(data: ApiTypes.User.Delete.Request): Promise<ApiTypes.User.Delete.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.delete(`/users/${data.user_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.User.Delete.Response>> = [
          { code: HttpStatusCode.NoContent,     handler: (_) => ({ deleted: true, }) },
          { code: HttpStatusCode.Ok,            handler: (_) => ({ deleted: true, }) },
          { code: HttpStatusCode.Forbidden,     handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,      handler: (_) => ({ error: `User with UID ${data.user_uid} doesn't exist` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },
  }

  UserApps = {
    Create(data: ApiTypes.UserApps.Create.Request): Promise<ApiTypes.UserApps.Create.Response> { 
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.post(`/users/${data.user_uid}/apps?requesterUid=${data.requester_uid}&appUid=${data.app_info_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.UserApps.Create.Response>> = [
          { code: HttpStatusCode.Created,           handler: (_) => ({ user_app: response.data }) },
          { code: HttpStatusCode.Ok,                handler: (_) => ({ user_app: response.data }) },
          { code: HttpStatusCode.Forbidden,         handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,          handler: (_) => ({ error: `User with UID ${data.user_uid} doesn't exist` }) },
          { code: HttpStatusCode.FailedDependency,  handler: (_) => ({ error: `App with UID ${data.app_info_uid} not found. Unable to assign to user` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Single(data: ApiTypes.UserApps.Single.Request): Promise<ApiTypes.UserApps.Single.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/users/${data.user_uid}/apps/${data.app_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.UserApps.Single.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ user_app: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `UserApp ${data.app_uid} on user ${data.user_uid} doesn't exist` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    All(data: ApiTypes.UserApps.All.Request): Promise<ApiTypes.UserApps.All.Response> {
      const responseAdapter: ResponseAdapter = (r: any) => {
        r.app_info_uid = r.application_info.app_info_uid;
        r.user_uid = r.user.user_uid;
        r.app_info_description = r.application_info.app_info_description;
        return r;
      }
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/users/${data.user_uid}/apps?requesterUid=${data.requester_uid}`);
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.UserApps.All.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ all: adaptResponse(response, responseAdapter) }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `User with uid ${data.user_uid} does not have any UserApps` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },
    Update(data: ApiTypes.UserApps.Update.Request): Promise<ApiTypes.UserApps.Update.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.put(`/users/${data.user_uid}/apps/${data.app_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.UserApps.Update.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ updated_user_app: response.data, }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `UserApp with APP ID ${data.app_uid} belonging to user ${data.user_uid} not found` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Delete(data: ApiTypes.UserApps.Delete.Request): Promise<ApiTypes.UserApps.Delete.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.delete(`/users/${data.user_uid}/apps/${data.app_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.UserApps.Delete.Response>> = [
          { code: HttpStatusCode.NoContent, handler: (_) => ({ deleted: true, }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `UserApp with APP ID ${data.app_uid} belonging to user ${data.user_uid} not found` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },
  }

  ApplicationInfo = {
    Create(data: ApiTypes.ApplicationInfo.Create.Request): Promise<ApiTypes.ApplicationInfo.Create.Response> {
      data.description = data.description.trim().toUpperCase();
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.post(`/application-info?requesterUid=${data.requester_uid}`, { app_info_description: data.description } as ApplicationInfoRow)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ApplicationInfo.Create.Response>> = [
          { code: HttpStatusCode.Created,     handler: (_) => ({ app_info: response.data }) },
          { code: HttpStatusCode.Forbidden,   handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.Found,       handler: (_) => ({ error: `App with identifier "${data.description}" already exists.` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Single(data: ApiTypes.ApplicationInfo.Single.Request): Promise<ApiTypes.ApplicationInfo.Single.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/application-info/${data.app_info_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ApplicationInfo.Single.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ app_info: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `Application info with UID ${data.app_info_uid} doesn't exist` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    All(data: ApiTypes.ApplicationInfo.All.Request): Promise<ApiTypes.ApplicationInfo.All.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.get(`/application-info?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ApplicationInfo.All.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ all: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Update(data: ApiTypes.ApplicationInfo.Update.Request): Promise<ApiTypes.ApplicationInfo.Update.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.put(`/application-info/${data.app_uid}?requesterUid=${data.requester_uid}`, { ...data.updated_app_info })
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ApplicationInfo.Update.Response>> = [
          { code: HttpStatusCode.Ok,        handler: (_) => ({ updated_app_info: response.data }) },
          { code: HttpStatusCode.Forbidden, handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,  handler: (_) => ({ error: `Application info with UID ${data.app_uid} doesn't exist` }) },
          { code: HttpStatusCode.Found,     handler: (_) => ({ error: `An app with the identifier "${data.updated_app_info.app_info_description}" already exists` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },

    Delete(data: ApiTypes.ApplicationInfo.Delete.Request): Promise<ApiTypes.ApplicationInfo.Delete.Response> {
      return new Promise(async (resolve, _) => {
        const response = await defaultAxios.delete(`/application-info/${data.app_uid}?requesterUid=${data.requester_uid}`)
        const handlers: Array<ResponseCodeHandler<typeof response, ApiTypes.ApplicationInfo.Delete.Response>> = [
          { code: HttpStatusCode.NoContent,   handler: (_) => ({ deleted: true, }) },
          { code: HttpStatusCode.Ok,          handler: (_) => ({ deleted: true, }) },
          { code: HttpStatusCode.Forbidden,   handler: (_) => ({ error: "You don't have permission to access this resource" }) },
          { code: HttpStatusCode.NotFound,    handler: (_) => ({ error: `Application info with UID ${data.app_uid} doesn't exist` }) },
        ]
        resolve(handleResponse(response, handlers, { error: `${response.data.error || "Unknown error"}` }))
      })
    },
  }
}

export default SpringRestApi;
