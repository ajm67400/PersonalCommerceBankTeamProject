import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../api/api-types";

// redirects to /login if not logged in 
const useAuthRedirect = (user: User | null) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/login")
    }   
  }, [user, navigate]);
  return user;
}

export default useAuthRedirect;
