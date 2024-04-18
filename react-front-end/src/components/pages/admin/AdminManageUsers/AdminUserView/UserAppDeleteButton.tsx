import { AlertDialog, AlertDialogFooter, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogOverlay, AlertDialogBody, Button, useDisclosure, useToast } from '@chakra-ui/react'
import { ApplicationInfoRow } from '../../../../../api/api-types'
import { DeleteIcon } from '@chakra-ui/icons'
import { useUserApps, } from '../../../../../hooks/api-user-hooks'
import { User } from '../../../../../api/api-types'
import { useRef, useState } from 'react'

const UserAppDeleteButton = ({ user, appInfo, onDelete, }: {
  user: User,
  appInfo: ApplicationInfoRow,
  onDelete?: (data: Object) => void; 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const toast = useToast();
  const [deleting, setDeleting] = useState<boolean>(false);
  const deleteUserApp = useUserApps.Delete(user.user_uid, appInfo.app_info_uid);
  const handleDelete = async () => {
    if (!deleteUserApp) return;

    setDeleting(true);
    const result = await deleteUserApp();
    onClose();
    if (result.deleted) {
      toast({
        title: `Unassigned ${appInfo.app_info_description} from user ${user.user_id}`,
        status: "warning",
        position: "top",
      });
      if (onDelete) onDelete({ user: user, appInfo: appInfo });
    } else {
      toast({
        title: `Failed to remove ${appInfo.app_info_description} from ${user.user_id}: ${result.error || "Unknown error"}`,
        duration: 20000,
        status: "error",
        position: "top",
      });
    }
    setDeleting(false);
  }

  return (
    <>
      <Button 
        isLoading={deleting}
        onClick={onOpen}
        colorScheme='red'>
        <DeleteIcon  />
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
            <AlertDialogHeader fontSize={"1.5em"}>Delete {appInfo.app_info_description} from {user.user_id}</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody fontSize={"1.2em"}>
              Are you sure you want to <span style={{color: "red"}}>remove</span> <strong>{appInfo.app_info_description}</strong> from <strong>{user.user_id}</strong>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button isLoading={deleting} onClick={handleDelete} colorScheme='red' ml={3}>
                <DeleteIcon marginRight={"5px"} /> <strong>Delete</strong>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  )
}

export default UserAppDeleteButton
