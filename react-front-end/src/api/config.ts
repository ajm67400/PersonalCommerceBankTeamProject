import axios from "axios";

const SPRING_API_SERVER = `http://localhost:8080/`

const defaultAxios = axios.create({
  baseURL: `${SPRING_API_SERVER}`,
  headers: { 
    "Content-Type": "application/json",
  },
});

defaultAxios.interceptors.request.use(
  (config) => {
    return Promise.resolve(config);
  },
  (error) => Promise.reject(error)
);

defaultAxios.interceptors.response.use(
  (response) => Promise.resolve(response),
  (error) => Promise.resolve(error.response),
);

export default defaultAxios;
