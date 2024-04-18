import { useState, useEffect } from "react";
import { Input, useToast } from '@chakra-ui/react'
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  Stack
} from '@chakra-ui/react'
import "./Login.scss";
import { useNavigate } from "react-router-dom";
import { ApiTypes } from "../../../api/api-types";
import useUser from "../../../hooks/local-user-hook";
import useApi from "../../../hooks/api-hook";


const LoginPage = () => {
  const api = useApi();
  const [user, setUser] = useUser()
  const navigate = useNavigate(); 

  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invalidLoginAttempt, setInvalidLoginAttempt] = useState(false);
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  })
  if (user) return null; // do not render login modal, we are redirecting

  const validateForm = (): boolean => {
    const isUsernameValid = () => username.trim() !== '';
    const isPasswordValid = () => password.trim() !== '';
    if (!isUsernameValid()) {
      setUsernameInvalid(true);
      return false;
    }
    if (!isPasswordValid()) {
      setPasswordInvalid(true); 
      return false;
    }
    return true;
  }

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    const response: ApiTypes.Login.Response = await api.Account.Login({ username: username, password: password });
    if (response.error) {
      setInvalidLoginAttempt(true);
      setSubmitting(false);
      toast({ 
        title: "Invalid login details", 
        isClosable: false, 
        duration: 2000,
        status: "error",
        position: "top"
      })
      return;
    }
    setInvalidLoginAttempt(false);
    if (response.user)
      setUser(response.user);
  }

  const handleUsernameInput = (e: any) => {
    setUsername(e.target.value)
  }

  const handlePasswordInput = (e: any) => {
    setPassword(e.target.value);
  }

  return (
    <div className="login-page">
      <div className="login-modal">
        <form method="POST" onSubmit={handleFormSubmit}>
          <Stack spacing={7} direction="column" align="center">
            <h1>Log In</h1>
              <FormControl isInvalid={usernameInvalid || invalidLoginAttempt}>
                <FormLabel>Username</FormLabel>
                <Input onChange={handleUsernameInput} type="text" />
                <FormErrorMessage>
                  {invalidLoginAttempt ? "Check login details" : "Username required"}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={passwordInvalid || invalidLoginAttempt}>
                <FormLabel>Password</FormLabel>
                <Input onChange={handlePasswordInput} type="password" autoComplete="on" />
                <FormErrorMessage>
                  {invalidLoginAttempt ? "Check login details" : "Password required"}
                </FormErrorMessage>
              </FormControl>
              <FormControl className="login-submit-control">
                <Button 
                  isLoading={submitting} 
                  type="submit"
                  className="login-submit-btn">
                  Login
                </Button>
              </FormControl>
          </Stack>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
