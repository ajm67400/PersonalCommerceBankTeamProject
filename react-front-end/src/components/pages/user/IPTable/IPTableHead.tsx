import { Tr, Th, Button, useDisclosure } from "@chakra-ui/react"
import { AddIcon } from "@chakra-ui/icons"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import IPTableRowAddPage from "./IPTableRowAddPage";
import useHardRouteUpdate from "../../../../hooks/components-hard-update";

function IPTableHead(): React.JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const forceReload = useHardRouteUpdate("/user/ip-table", "user");

  const handleRecordAdd = () => {
    onClose(); // close the "add ip" modal
    forceReload();
  }

  return (
    <Tr>
        <Th>Server ID</Th>
        <Th>App</Th>
        <Th>Hostname</Th>
        <Th>Address</Th>
        <Th>Port</Th>
        <Th className='row-action-th'></Th>{/* "View details button for row" column */}
        <Th className='row-action-th'></Th>{/* "Edit details for button row" column */}
        <Th>
          <Button onClick={() => onOpen()} className="add-ip-record-button commerce-button">
              <AddIcon />
          </Button>
          <Modal
            isOpen={isOpen}
            onClose={onClose}
          >
            <ModalOverlay />
            <ModalContent className="commerce-yellow-border">
              <ModalHeader>Create Whitelisted IP Record</ModalHeader>
              <ModalCloseButton />
              <IPTableRowAddPage onAddRecord={handleRecordAdd} />
            </ModalContent>
          </Modal>
        </Th>
    </Tr>
  )
}

export default IPTableHead
