import { AddIcon } from '@chakra-ui/icons'
import { Button, FormControl, FormLabel, Input, Th, Tr, useDisclosure, useToast } from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import useApi from '../../../../hooks/api-hook'
import { User } from '../../../../api/api-types'
import useHardRouteUpdate from '../../../../hooks/components-hard-update'

const AppsTableHead = ({admin}: {admin: User}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appName, setAppName] = useState<string>('');

  const api = useApi();
  const toast = useToast();
  const forceReload = useHardRouteUpdate("/admin/application-info", "admin");

  const appNameTextboxRef = useRef();

  const handleCreateApp = () => {
    if (appName.trim() === '') {
      toast({
        title: `You must enter an application name`,
        status: "error",
        position: "top",
        duration: 3000,
      })
      return;
    }
    async function createAppInfo() {
      const response = await api.ApplicationInfo.Create({ description: appName, requester_uid: admin.user_uid }) 
      if (!response.app_info) {
        toast({
          title: `Unable to create app info "${appName}": ${response.error || "Unknown error"}`,
          status: "error",
          position: "top",
          duration: 4000,
        })
        return;
      }
      toast({
        title: `Created application ${appName}`,
        status: "success",
        position: "top",
        duration: 4000,
      })
      onClose();
      forceReload();
    }
    (async () => await createAppInfo())();
  }

  return (
    <Tr className="admin-apps-table-head">
      <Th>App ID</Th>
      <Th>App Descriptor</Th>
      <Th className='row-action-th'></Th>{/* Do not remove. Column for action buttons */}
      <Th className='row-action-th'>
        <Button onClick={onOpen} className="commerce-button user-add-button">
          <AddIcon />
        </Button>
        <Modal initialFocusRef={appNameTextboxRef} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create Application</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>App Name</FormLabel>
                <Input ref={appNameTextboxRef} style={{textTransform: "uppercase"}} onChange={(e) => setAppName(e.target.value.toUpperCase())} className='commerce-input' placeholder='MET' />
              </FormControl>
            </ModalBody> 
            <ModalFooter className='commerce-yellow-border'>
              <Button onClick={onClose} mr={5}>Close</Button>
              <Button type="submit" onClick={handleCreateApp} className='commerce-bg-1'>
                Create
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Th>
    </Tr>
  )
}

export default AppsTableHead
