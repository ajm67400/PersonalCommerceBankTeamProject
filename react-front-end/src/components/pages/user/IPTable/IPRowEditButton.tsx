import { EditIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const IPRowEditButton = ({ serverId }: {
    serverId: string | number
}) => {
  const navigate = useNavigate();
  const handleEditDetailsOfThisRow = () => {
    navigate(`/user/ip-table/${serverId}/edit`) 
  }
  return (
    <>
        <Button style={{backgroundColor: "#ffd006"}} colorScheme='yellow' onClick={handleEditDetailsOfThisRow}>
            <EditIcon />
        </Button>
    </>
  )
}

export default IPRowEditButton;
