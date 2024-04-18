import { EditIcon } from '@chakra-ui/icons'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  FormLabel,
} from '@chakra-ui/react'
import { ApplicationInfoRow } from '../../../../api/api-types'
import { useState } from 'react';

const AppsTableRowEditModal = ({ row, onSubmit }: {
  row: ApplicationInfoRow,
  onSubmit: (newApp: ApplicationInfoRow) => void;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [appInfo, setAppInfo] = useState<ApplicationInfoRow>(row);

  return (
    <>
      <Button onClick={onOpen} style={{backgroundColor: "#ffd006"}} colorScheme='yellow'>
        <EditIcon /> 
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit application {row.app_info_description}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Application Name</FormLabel>
              <Input 
                defaultValue={row.app_info_description}
                className="commerce-input" 
                onChange={(e) => setAppInfo({ ...appInfo, app_info_description: e.target.value })} 
              />
            </FormControl>
          </ModalBody>
          <ModalFooter className='commerce-yellow-border'>
            <Button mr={5} onClick={onClose}>
              Close
            </Button>
            <Button 
              isDisabled={appInfo.app_info_description === row.app_info_description} // no changes to submit
              onClick={() => onSubmit(appInfo)} className='commerce-bg-1'
            >Apply changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AppsTableRowEditModal
