import { AlertDialog, AlertDialogFooter, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogOverlay, AlertDialogBody, Button, useDisclosure, useToast } from '@chakra-ui/react'
import { ApplicationInfoRow } from '../../../../api/api-types'
import { DeleteIcon } from '@chakra-ui/icons';
import { useEffect, useRef, useState } from 'react';
import useApi from '../../../../hooks/api-hook';

const AppsTableRowDeleteAlert = ({ row, onSubmit }: {
  row: ApplicationInfoRow,
  onSubmit: Function,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const cancelRef = useRef();

  const handleSendCallback = () => {
    setLoading(true);
    onSubmit();
    setTimeout(() => setLoading(false), 600);
  }
  
  return (
    <>
    <Button onClick={onOpen} colorScheme='red'>
      <DeleteIcon /> 
    </Button>
    <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        className="user-app-deletion-modal"
      >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader fontSize={"1.5em"}>Delete application {row.app_info_description}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody fontSize={"1.2em"}>
          Are you sure you want to <span style={{color: "red"}}>remove</span> <strong>{row.app_info_description}</strong>?
          <br />
          <br />
          This will also:
          <br />
          <span style={{color: 'red'}}>- Unassign <strong>{row.app_info_description}</strong> from any users assigned to it</span><br />
          <span style={{color: 'red'}}>- Delete all server info records for <strong>{row.app_info_description}</strong></span><br />
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={loading} onClick={() => handleSendCallback()} colorScheme='red' ml={3}>
            <DeleteIcon marginRight={"5px"} /> <strong>Delete {row.app_info_description}</strong>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default AppsTableRowDeleteAlert
