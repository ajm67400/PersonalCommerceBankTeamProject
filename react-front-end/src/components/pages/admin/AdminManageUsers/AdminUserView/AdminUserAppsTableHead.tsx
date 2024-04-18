import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { Button, Checkbox, FormControl, FormLabel, Input, Spinner, Th, Tr, border, useDisclosure, useToast } from "@chakra-ui/react";
import { ApplicationInfoRow, User } from "../../../../../api/api-types";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from "react";
import useApi from "../../../../../hooks/api-hook";
import { UserContext } from "../../../../ip-whitelist-tracker-types";
import { useNavigate, useOutletContext } from "react-router-dom";
import PopoverButton from "../../../../PopoverButton";
import "../../../../../global-styles.scss";
import useHardRouteUpdate from "../../../../../hooks/components-hard-update";

const appsListStyle: React.CSSProperties = {
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  fontSize: "1.2em",
  maxHeight: "300px",
  overflowY: "scroll",
}
const appOptionStyle: React.CSSProperties = {
  borderBottom: "1px solid gray",
  padding: "1em 0",
  display: "flex",
  justifyContent: "space-between",
}

type PendingChange = { action: "add" | "remove", app: ApplicationInfoRow };

// Not used as a react component <></>
function AdminUserAppsTableHead(user: User, usersApps: Array<ApplicationInfoRow>, setUsersApps: Function): React.JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const api = useApi(); // useAppinfos hook would not work here for some reason
  const navigate = useNavigate();
  const toast = useToast();
  const forceUpdate = useHardRouteUpdate(`/admin/manage-users/${user.user_uid}/view`, "admin")

  const { userContext, tabRoutes } = useOutletContext();
  const [admin, logout]: UserContext = userContext;

  const [committing, setCommitting] = useState<boolean>(false);
  const [appFilter, setAppFilter] = useState<string>('');
  const [visibleAppCount, setVisibleAppCount] = useState<number>(0);
  const [appOptions, setAppOptions] = useState<Array<ApplicationInfoRow>>([]);
  const [pendingChanges, setPendingChanges] = useState<Array<PendingChange>>([]);

  // I recommend not to look at or touch the atrocity from this line onward. your eyes will start burning

  // runs when "add app" modal is opened
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    async function fetchAvailableApps() {
      const response = await api.ApplicationInfo.All({ requester_uid: admin.user_uid })
      if (!response.all) {
        setAppOptions([]);
        setVisibleAppCount(0);
        toast({ title: `Could not fetch available apps: ${response.error || "Unknown error"}`, position: "top", status: "error", })
      } else {
        setAppOptions(response.all!);
        setVisibleAppCount(response.all!.length);
      }
      setLoaded(true);
    }

    if (isOpen) {
      (async () => await fetchAvailableApps())()
    }
  }, [isOpen])


  // runs when text inside search box in "add app" modal changes
  useEffect(() => {
    setVisibleAppCount(appOptions.filter(a => a.app_info_description.toLowerCase().includes(appFilter.toLowerCase())).length)
  }, [appFilter])


  // runs once user selects at least one app info to add to the user in th "add app" modal and clicks apply
  useEffect(() => {
    if (!committing) {
      onClose(); // close modal, we just finished committing
    }
    if (committing && pendingChanges.length > 0) {
      // push changes 
      const committingAlert = toast({
        title: `Committing changes...`,
        status: "loading",
        position: "top",
      })
      async function push() {
        async function addUserApp(app: ApplicationInfoRow) {
          const response = await api.UserApps.Create({ app_info_uid: app.app_info_uid, user_uid: user.user_uid, app_description: app.app_info_description, requester_uid: admin.user_uid })
          if (!response.user_app) {
            toast({
              title: `Failed to CREATE user app ${app.app_info_description} on user ${user.user_id}: ${response.error}`,
              position: "top",
              status: "error",
              duration: 10000,
            })
            return;
          }
        }

        async function deleteUserApp(app: ApplicationInfoRow) {
          const response = await api.UserApps.Delete({ app_uid: app.app_info_uid, user_uid: user.user_uid, requester_uid: admin.user_uid })
          if (!response.deleted) {
            toast({
              title: `Failed to DELETE user app ${app.app_info_description} on user ${user.user_id}: ${response.error}`,
              position: "top",
              status: "error",
              duration: 10000,
            })
            return;
          }
        }

        for (const change of pendingChanges) {
          switch (change.action) {
            case "add":
              await addUserApp(change.app);
              break;
            case "remove":
              await deleteUserApp(change.app);
              break;
            default:
              break;
          }
        }

        forceUpdate();

        toast.close(committingAlert);
        toast({
          title: `User updated`,
          status: "success",
          duration: 3000,
          position: "top",
        })
        setCommitting(false);
      }

      (async () => await push())();
    }
  }, [committing])

  const handleAppChange = (change: PendingChange) => {
    const changeForAppIndex = pendingChanges.findIndex(c => c.app === change.app);
    if (changeForAppIndex !== -1) {
      const changeForApp = pendingChanges[changeForAppIndex];
      // we've already done something to this app on the selection modal
      if (changeForApp.action !== change.action) {
        // nullified, remove pending change and toggle this app back to original state
        setPendingChanges(pendingChanges.filter((c: PendingChange) => c !== changeForApp))
      }
      // nothing changed
      return;
    }
    setPendingChanges([...pendingChanges, change])
  }

  const handlePushChanges = () => {
    // actually applies the changes and closes modal
    setCommitting(true);
  }

  const handleModalClose = () => {
    setPendingChanges([]);
    setAppFilter('')
    onClose();
  }

  const handleFilter = (e: any) => {
    const newFilter: string = e.target.value.trim();
    setAppFilter(newFilter);
  }

  const buildAppsList = (app: ApplicationInfoRow, index: number) => {
    const checkedDefault = usersApps.findIndex(u => u.app_info_uid === app.app_info_uid) !== -1;
    // we cant have a "filteredList" and "list" state without the state desyncing upon filtering
    const hidden = appFilter ? !app.app_info_description.toLowerCase().includes(appFilter.toLowerCase()) : false;

    return (
      <li style={appOptionStyle} hidden={hidden} key={index} value={app.app_info_uid}>
        <span>{app.app_info_description}</span>
        <Checkbox
          key={index}
          onChange={(e) => handleAppChange({ action: e.target.checked ? "add" : "remove", app: app })}
          id={`app-${app.app_info_uid}-assignment-checkbox`}
          marginRight={"1em"}
          size="lg"
          defaultChecked={checkedDefault}
        />
      </li>
    )
  }

  return (
    <Tr>
      <Th>App</Th>
      <Th className='row-action-th'>
        <Button onClick={onOpen} className="commerce-button assign-app-button">
          <AddIcon />
        </Button>
        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isOpen}
          onClose={handleModalClose}
        >
          <ModalOverlay />
          <ModalContent>
            {!loaded ?
              <Spinner
                style={{ position: "absolute", top: "30vh", left: "20vw", transform: "scale(3)" }}
                thickness='5px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
              />
              :
              <div className="app-selector-modal">
                <ModalHeader>Assign applications to <strong>{user.user_id}</strong></ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  <FormControl id="app-filter-field">
                    <FormLabel>Available Apps</FormLabel>
                    <div style={{ display: "flex" }} className="app-filter">
                      <SearchIcon marginRight={"10px"} width={"1.3em"} height={"auto"} filter={"contrast(10%)"} />
                      <Input
                        className="commerce-input"
                        onChange={handleFilter}
                        ref={initialRef}
                        placeholder='App Descriptor (i.e. INF, PUP, MET)' />
                    </div>
                  </FormControl>

                  <FormControl id="app-selection-field" style={{ marginTop: "2.2em" }} mt={4}>
                    <FormLabel>
                      {`Select from ${visibleAppCount} apps`}
                    </FormLabel>
                    <ul style={appsListStyle} className="available-apps-list">
                      {appOptions.map(buildAppsList)}
                    </ul>
                  </FormControl>
                </ModalBody>

                <ModalFooter className="commerce-yellow-border" style={{ justifyContent: "space-between", }} >
                  <div className="pending-changes">
                    {pendingChanges.length === 0 ?
                      <span className="no-changes">No changes</span>
                      :
                      <div className="staged-changes">
                        <p style={{ color: "green" }} className="staged-additions">
                          + Add {pendingChanges.filter(c => c.action === "add").length} apps
                        </p>
                        <p style={{ color: "red" }} className="staged-deletions">
                          - Delete {pendingChanges.filter(c => c.action === "remove").length} apps
                        </p>
                      </div>
                    }
                  </div>
                  <div className="modal-choices">
                    <Button style={{marginRight: "1em"}} onClick={handleModalClose}>Cancel</Button>
                    <PopoverButton
                      loading={committing}
                      disabled={pendingChanges.length === 0}
                      onConfirm={handlePushChanges}
                      buttonText="Apply changes"
                      popoverHeader={<span>Confirm <strong>{pendingChanges.length}</strong> changes</span>}
                      popoverBody={
                        <>
                          <span>Are you sure you want to make the following changes to <strong>{user.user_id}</strong>?</span>
                          {pendingChanges.map((change, index) => {
                            return (
                              <p key={index} style={{ color: change.action === "add" ? "green" : "red" }}>
                                {change.action === "add" ? '+ Add' : '- Delete'} <strong>{change.app.app_info_description}</strong> {change.action === "add" ? "to" : "from"} <strong>{user.user_id}</strong>
                              </p>
                            )
                          })}
                        </>
                      }
                    />
                  </div>
                </ModalFooter>
              </div>
            }
          </ModalContent>
        </Modal>
      </Th>{/* "Add app button" column " */}
    </Tr>
  )
}

export default AdminUserAppsTableHead;

