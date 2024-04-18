import { AddIcon } from "@chakra-ui/icons"
import { Button, FormControl, FormLabel, Input, Select, Stack, Th, Tr, useDisclosure, useToast } from "@chakra-ui/react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import useApi from "../../../../hooks/api-hook";
import { useRef, useState } from "react";
import { Role } from "../../../ip-whitelist-tracker-types";
import { User } from "../../../../api/api-types";
import useHardRouteUpdate from "../../../../hooks/components-hard-update";

function AdminUsersTableHead({admin}: {admin: User}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const usernameFieldRef = useRef();

  const [userId, setUserId] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('');
  const [role, setRole] = useState<Role>("user");

  const forceUpdate = useHardRouteUpdate("/admin/manage-users", "admin");
  const toast = useToast();
  const api = useApi();

  const handleCreateUser = () => {
    async function createUser() {
      const loadingToast = toast({
        title: `Creating user...`,
        status: "loading",
        position: "top",
        duration: 5000,
      })

      const response = await api.User.Create({ id: userId, role: role, password: userPassword, requester_uid: admin.user_uid, })

      toast.close(loadingToast);
      if (!response.user) {
        toast({
          title: `Error creating user: ${response.error || "Unknown error"}`,
          status: "error",
          position: "top",
          duration: 5000,
        })
        return;
      }
      onClose();
      toast({
        title: `Created user ${userId}`,
        status: "success",
        position: "top",
        duration: 2000,
      })
      // view user we just created
      forceUpdate(`/admin/manage-users/${response.user.user_uid}/view`);
    }

    if (userId.trim() === '') {
      toast({
        title: `You must enter a username`,
        status: "error",
        position: "top",
        duration: 4000,
      })
      return;
    } else if (!["user", "admin"].includes(role)) {
      toast({
        title: `"${role}" is not a valid role`,
        status: "error",
        position: "top",
        duration: 4000,
      })
      return;
    } else if (userPassword.length === 0) {
      toast({
        title: `You must enter a password for this user`,
        status: "error",
        position: "top",
        duration: 4000,
      })
      return;
    }
    (async () => await createUser())();
  }

  return (
    <Tr className="admin-users-table-head">
        <Th>User ID</Th>
        <Th>Username</Th>
        <Th>Role</Th>
        <Th className='row-action-th'>
          <Button onClick={onOpen} className="commerce-button user-add-button">
            <AddIcon />
          </Button>
           <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={usernameFieldRef}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Create User</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Stack spacing={12}>
                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Input ref={usernameFieldRef} placeholder="user" onChange={(e) => setUserId(e.target.value)} className="commerce-input" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input type="password" placeholder="A strong password" onChange={(e) => setUserPassword(e.target.value)} className="commerce-input" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Role</FormLabel>
                      <Select onChange={(e) => setRole(e.target.value as Role)} className="commerce-select">
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </Select>
                    </FormControl>
                  </Stack>
                </ModalBody>
                <ModalFooter className="commerce-yellow-border">
                  <Button mr={3} onClick={onClose}>
                    Close
                  </Button>
                  <Button onClick={handleCreateUser} className="commerce-bg-1">Create</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
        </Th>{/* Column for "View assigned apps" button */}
    </Tr>
  )
}

export default AdminUsersTableHead
