import { AddIcon } from "@chakra-ui/icons"
import { Button } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

const UserAppAssignButton = () => {
  const navigate = useNavigate(); 

  const handleClick = () => {
    navigate(``)    
  }

  return (
    <Button onClick={handleClick} style={{backgroundColor: "rgba(0, 0, 0, 0.5)", color: "white"}}>
      <span><AddIcon style={{marginRight: "5px"}} /> Assign App</span>
    </Button>
  )
}

export default UserAppAssignButton    
