import RestApi from "../api/api"
import { Api } from "../api/api-types"

// NOTE: Always use this useApi hook for sending requests to backend
// don't instantiate new api object in a component

const apis: Record<string, Api> = {
  //mock: new MockApi(),
  rest: new RestApi(), 
}
const useApi = () => {
  return apis.rest;
}

export default useApi;
