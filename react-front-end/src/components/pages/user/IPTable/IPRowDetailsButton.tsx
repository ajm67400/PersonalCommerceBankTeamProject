import { InfoIcon } from '@chakra-ui/icons'
import { Button } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

// TODO make edit, details, and delete buttons into a single component instead of 3 separate
const IPRowDetailsButton = ({ serverId }: {
    serverId: string | number
}) => {
  const navigate = useNavigate();
  const handleViewDetailsOfThisRow = () => {
    navigate(`/user/ip-table/${serverId}/view`) 
  }
  return (
    <>
        <Button colorScheme='blue' onClick={handleViewDetailsOfThisRow}>
            <InfoIcon />
        </Button>
    </>
  )
}

export default IPRowDetailsButton
