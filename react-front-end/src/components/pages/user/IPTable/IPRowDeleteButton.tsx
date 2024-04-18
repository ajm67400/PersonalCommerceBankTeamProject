import { DeleteIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

// TODO make edit, details, and delete buttons into a single component instead of 3 separate
const IPRowDeleteButton = ({ serverId }: {
    serverId: string | number
}) => {
  const navigate = useNavigate();
  const handleDeleteThisRow = () => {
    navigate(`/user/ip-table/${serverId}/delete`) 
  }
  return (
    <>
        <Button colorScheme='red' onClick={handleDeleteThisRow}>
            <DeleteIcon />
        </Button>
    </>
  )
}

export default IPRowDeleteButton;
