import { ApplicationInfoRow, User, UserAppsRow } from '../../../../api/api-types'
import CommerceTable from '../../../CommerceTable/CommerceTable'
import { ColumnFilterEntry } from '../../../CommerceTable/FilterFunnelColumnPicker'
import AdminUserAppsTableHead from './AdminUserView/AdminUserAppsTableHead'
import AdminUserAppsTableBody from './AdminUserView/AdminUserAppsTableBody'
import { useRef, useState } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { Button, ButtonGroup, Editable, EditableInput, EditablePreview, IconButton, Input, Td, ToastId, Tr,  useDisclosure,  useEditableControls, useToast } from '@chakra-ui/react'
import KeyValueTable, { RowMapperFunc } from '../../../KeyValueTable'
import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import useApi from '../../../../hooks/api-hook'
import { Role } from '../../../ip-whitelist-tracker-types'
import "./AdminUserView/AdminUserView.scss";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import useHardRouteUpdate from '../../../../hooks/components-hard-update'

const singleViewStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "flex-start",
  margin: "3em 4em",
  marginTop: "0",
}
const AdminUserView = ({ admin, userToView, apps }: {
  admin: User,
  userToView: User,
  apps: Array<UserAppsRow>,
}) => { 
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelUserDeletionRef = useRef()

  const api = useApi();
  const toast = useToast();
  const forceUpdate = useHardRouteUpdate(`/admin/manage-users/${userToView.user_uid}/view`, "admin");

  // only need application_info_description from apps, which overlaps wth UserAppsRow
  const [appInfos, setAppInfos] = useState<Array<ApplicationInfoRow>>((apps as any) as Array<ApplicationInfoRow>);

  const filterableColumns: Array<ColumnFilterEntry<ApplicationInfoRow>> = [
    { column: "app_info_description", displayName: "App ID" },
  ]

  const handleTableCallback = (data: Object, rows: Array<ApplicationInfoRow>, setRows: Function) => {
    const obj = data as any;  
    if (obj.appInfo) {
      forceUpdate();
    }
  }

  const userSingleViewRowMapper = (key: keyof User) => {
    if (key as string === "user_password") return null; 
    const unmodifiableRows: Array<keyof User> = [
      "user_uid",
      "modified_at",
      "modified_by",
      "created_by",
      "created_at",
    ]
    const EditorField = () => {
      return (
        <>
          <Input 
            style={{maxWidth: "200px"}}
            as={EditableInput} 
          />
          {unmodifiableRows.includes(key) ? null : <EditControls />}
        </>
      );
    }

    const adaptValue = () => {
      if (key === "created_at" || key === "modified_at") {
        const millis = Number(userToView[key]);
        if (!isNaN(millis)) {
          return new Date(millis).toLocaleString(); 
        }
      }
      return String(userToView[key]);
    }

    const handleUserEdit = (key: keyof User, value: string) => {
      // only user_id and user_role are editable
      value = value.trim();
      const userId = key === "user_id" ? value : userToView.user_id;
      const userRole = key === "user_role" ? value : userToView.user_role;
      if (userToView.user_id === admin.user_id && userRole != admin.user_role) {
        toast({
          title: "You can't change your own role.",
          position: "top",
          status: "error",
        });
        forceUpdate();
        return;        
      }
      if (userId === userToView.user_id && userRole === userToView.user_role) {
        // no changes were made
        return;
      }
      if (!["admin", "user"].includes(userRole)) {
        toast({
          title: `"${userRole}" is not a valid role. Unable to modify user`,
          status: "warning",
          position: "top",
          duration: 4000,
        });
        forceUpdate();
        return;
      }

      const loadingToast = toast({
        title: "Applying edits...",
        status: "loading",
        position: "top",
      });

      async function updateUser() {
        const response = await api.User.Update({
          user_uid: userToView.user_uid,
          requester_uid: admin.user_uid, 
          updated_user: {
            user_uid: userToView.user_uid,
            user_id: userId,
            user_role: userRole as Role,
          }
        })
        toast.close(loadingToast);
        forceUpdate();
        if (!response.updated_user) {
          toast({
            title: `Failed to update user: ${response.error || "Unknown error"}`,
            status: "error",
            position: "top",
            duration: 5000,
          });
          return;
        }
        toast({
          title: `User updated`,
          status: "success",
          position: "top",
          duration: 5000,
        });
      }
      (async () => await updateUser())();
    }

    return (
      <Tr key={key}>
        <Td>{key}</Td>
        <Td>
          <Editable 
            style={{display: "flex", justifyContent: "space-between"}}
            textAlign="center" 
            isPreviewFocusable={false}
            onSubmit={(v) => handleUserEdit(key as keyof User, v)}             
            defaultValue={adaptValue()}>
            <EditablePreview />
            <EditorField />
          </Editable>
        </Td>
      </Tr>
    )
  }

  const EditControls = () => {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls()
    const editBtnStyle = {
      backgroundColor: "#ffd006", 
      color: "black",
    }
    const doneBtnStyle = {
      backgroundColor: "green",
      color: "white",
    }
    const cancelBtnStyle = {
      backgroundColor: "red",
      color: "white",
    }
    return isEditing ? (
      <ButtonGroup style={{marginLeft: "1em"}} justifyContent='center' size='sm'>
        <IconButton style={doneBtnStyle} icon={<CheckIcon style={doneBtnStyle} />} {...getSubmitButtonProps()} />
        <IconButton style={cancelBtnStyle} icon={<CloseIcon style={cancelBtnStyle} />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
        <IconButton 
          style={editBtnStyle}
          size='sm' 
          icon={<EditIcon style={editBtnStyle} />} 
          {...getEditButtonProps()} 
        />
    )
  }

  const handleUserDelete = () => {
    const loadingToast = toast({
      title: `Deleting ${userToView.user_id}`,
      status: "loading",
      position: "top",
    })
    // all user apps must be deleted to avoid foreign key constraint error 
    async function deleteUser() {
      const response = await api.User.Delete({ user_uid: userToView.user_uid, requester_uid: admin.user_uid });
      toast.close(loadingToast); 
      if (!response.deleted) {
        toast({
          title: `Failed to delete ${userToView.user_id}: ${response.error || "Unknown error"}`,
          status: "loading",
          position: "top",
        })
        return;
      }
      toast({
        title: `Deleted user successfully`,
        status: "success",
        position: "top",
      })
      forceUpdate("/admin/manage-users");
    }
    (async () => await deleteUser())();
  }

  return (
    <div style={singleViewStyle} className="admin-single-user-view">
      <div style={{flex: "75%", margin: "0 4em", maxWidth: "300px"}} className="user-apps">
        <CommerceTable 
          user={admin} 
          contextUser={userToView}
          filterableColumns={filterableColumns}
          tableRowSource={appInfos}
          tableHead={AdminUserAppsTableHead(userToView, appInfos, setAppInfos)}
          tableBodyBuilder={AdminUserAppsTableBody}
          tableBodyCallbackHandler={handleTableCallback}
          noSorting
          overflow
        />
      </div>
      <div style={{flex: "25%", margin: "4em 4em", marginTop: "9em", maxWidth: "700px"}} className="user-rud">
        <KeyValueTable 
          obj={userToView}
          rowMapper={userSingleViewRowMapper as RowMapperFunc} 
        />
        <div style={{marginTop: "1em"}} className="user-actions"> 
          {admin.user_uid !== userToView.user_uid ?
          <Button onClick={onOpen} colorScheme='red' variant="outline" className="delete-user-button">
            Delete User
          </Button>
          : null}
          <AlertDialog
          isCentered
          motionPreset='slideInBottom'
          isOpen={isOpen}
          leastDestructiveRef={cancelUserDeletionRef}
          onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader style={{fontSize: "1.5em"}} fontWeight='bold'>
                  <span style={{color: "red"}}>Delete <strong>{userToView.user_id}</strong></span> 
                </AlertDialogHeader>

                <AlertDialogBody style={{fontSize: "1.2em"}}>
                  Remove <strong>{userToView.user_id}</strong> permanently? This also removes all user apps.
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button ref={cancelUserDeletionRef} onClick={onClose}>
                    Cancel
                  </Button>
                  <Button colorScheme='red' onClick={handleUserDelete} ml={3}>
                    <DeleteIcon marginRight={"5px"} /> Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>             
        </div>
      </div>
    </div>
  )
}

export default AdminUserView
