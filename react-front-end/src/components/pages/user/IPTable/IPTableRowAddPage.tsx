import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ApiTypes, ApplicationInfoRow, ServerInfoRow } from '../../../../api/api-types';
import { 
    useToast,
    FormControl,
    Button,
    FormErrorMessage,
    FormLabel,
    Input,
    Checkbox,
    Select,
    Skeleton
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import "./IPTableRowAddPage.scss";
import { UserContext } from '../../../ip-whitelist-tracker-types';
import useApi from '../../../../hooks/api-hook';
import useHardRouteUpdate from '../../../../hooks/components-hard-update';

const IPTableRowAddPage = ({ onAddRecord }: {
  onAddRecord: Function,
}) => {
  const api = useApi();
  const toast = useToast();
  const [user, logout]: UserContext = useOutletContext();
  const [availableUserApps, setAvailableUserApps] = useState<Array<ApplicationInfoRow>>([]);
  const [appsLoaded, setAppsLoaded] = useState<boolean>(false);
  const forceReload = useHardRouteUpdate(`/user/ip-table`, "user");

  // checkbox state
  const [ipStatus, setIpStatus] = useState<string>("active");

  const toHumanLabel = (label: string): string => label
        .split("_")
        // capitalize first letter in each word, 
        // uppercase all instances of "IP" and "UID"
        // remove '_' between words
        .map((s: string) => `${s[0].toUpperCase() + s.slice(1)}`)
        .map((s: string) => s==="Ip"||s==="Uid"?s.toUpperCase():s)
        .map((s: string) => s==="Info"?"":s)
        .filter((s: string) => s)
        .join(" ")

  const handleAddRowToIPTable = async (values: Partial<ServerInfoRow>) => {
    const response: ApiTypes.ServerInfo.Create.Response = await api.ServerInfo.Create({ server_info: values, user_uid: user!.user_uid });
    if (!response.created) { 
        toast({ 
            title: `Error creating server info data: ${response.error || "Unknown error occurred"}`, 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
        })
        return;
    }
    toast({ 
        title: `Row created successfully`, 
        isClosable: false, 
        duration: 2000,
        status: "success",
        position: "top"
    })
    onAddRecord();
  }

  useEffect(() => {
    const queryUserApps = async () => {
      const response = await api.UserApps.All({ user_uid: user.user_uid, requester_uid: user.user_uid });
      if (!response.all) {
        toast({
          title: `Unable to load apps: ${response.error}`,
          status: "error",
          position: "top",
        })
        return;
      }
      let apps = []
      for (const userApp of response.all) {
        const appsResponse = await api.ApplicationInfo.Single({ app_info_uid: userApp.app_info_uid, requester_uid: user.user_uid });
        if (!appsResponse.app_info) { 
          toast({
            title: `Unable to load app uid ${userApp.app_info_uid}: ${response.error}`,
            status: "error",
            position: "top",
          })
          return;
        }
        apps.push(appsResponse.app_info);
      }

      setAvailableUserApps(apps);
      setAppsLoaded(true);
    }
    (async () => await queryUserApps())();
  }, [])

  const validateField = (key: keyof ServerInfoRow, value: string) => {
    if (value) value = value.trim();

    let error;
    if (!value) {
      error = "This field is required."
    } else if (key === "destination_port" && !(/^\d{1,5}$/.test(value))) {
      error = "Numeric value 1 - 5 digits is required for this field."
    } else if (key.includes("ip_address") && !(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/.test(value))) {
      error = "IP address is not in the correct format"
    }
    return error; 
  }

  const handleFormSubmit = async (values: any, _: any) => {
    const newServerInfoRow: Partial<ServerInfoRow> = {
      ...values,
      ip_status: ipStatus,
    }
    if (newServerInfoRow.app_info_uid as any === '') {
      if (!availableUserApps || availableUserApps.length === 0) {
        toast({
          title: "You need to select an application for this record.",
          status: "error",
          position: "top",
        })
        return;
      }
      newServerInfoRow.app_info_uid = availableUserApps[0].app_info_uid;
    }
    console.log("New server_info", newServerInfoRow);
    await handleAddRowToIPTable(newServerInfoRow);
  }

  const inputPlaceholders: Partial<Record<keyof ServerInfoRow, string>> = {
    source_hostname: "SOURCEHOST-123",
    source_ip_address: "192.168.83.1",
    destination_hostname: "DESTHOST-123",
    destination_ip_address: "192.168.2.5",
    destination_port: "25565",
  }
  const fields = { 
    app_info_uid: "",
    source_hostname: "",
    source_ip_address: "",
    destination_hostname: "",
    destination_ip_address: "",
    destination_port: "",
  } 
  return (
    <div style={{margin: "2em", marginTop: "0"}} className="ip-add-modal">
      <div className='ip-add-form-container'>  
        <Formik
            initialValues={fields}
            onSubmit={handleFormSubmit}
        >
          {(props) => (
            <Form style={{width: "100%"}}>
              <Field name="app_info_uid" key={"app_info_uid"}>
                {({field, form}: {field:any, form:any}) => (
                  <FormControl style={{margin: "1em 0"}}>
                    <FormLabel className="ip-add-form-label">Application</FormLabel>
                      {appsLoaded ? 
                        <Select 
                        {...field} 
                        className="commerce-select"  
                        >
                          {availableUserApps.map((app, index) => {
                            return (
                              <option key={index} value={app.app_info_uid}>{app.app_info_description}</option>
                            )
                          })}
                        </Select> 
                      : 
                        <Skeleton width={"100%"} height={"40px"} /> 
                      }
                      <FormErrorMessage>
                      <p style={{color: "red"}}>{form.errors.ip_status}</p>
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              {Object.keys(fields).map((infoKey: string, index: number) => {
                const key = infoKey as keyof ServerInfoRow;
                if (key === "ip_status" || key === "app_info_uid") return null;
                return (
                  <Field name={key} key={key} validate={(value: string) => validateField(key, value)}>
                    {({ field, form }: {field:any, form:any}) => (      
                      <FormControl style={{margin: "1em 0"}} isInvalid={form.errors[key] && form.touched[key]} key={index}>
                        <FormLabel className="ip-add-form-label">{toHumanLabel(key)}</FormLabel>
                        <Input {...field} 
                          className="commerce-input ip-add-input" 
                          placeholder={inputPlaceholders[key]} 
                          name={key} 
                          type="text" 
                        />
                        <FormErrorMessage>
                          <p style={{color: "red"}}>{form.errors[key]}</p>
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
              )})}
              <Field name="ip_status" key={"ip_status"}>
                {({field, form}: {field:any, form:any}) => (
                  <FormControl style={{margin: "1em 0"}}>
                    <FormLabel className="ip-add-form-label">Active</FormLabel>
                    <Checkbox {...field} 
                      className="ip-add-checkbox"
                      onChange={(v) => setIpStatus(v.target.checked?"active":"inactive")} 
                      name="ip_status" 
                      defaultChecked 
                    />
                    <FormErrorMessage>
                      <p style={{color: "red"}}>{form.errors.ip_status}</p>
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Button
                isDisabled={availableUserApps.length === 0}
                isLoading={props.isSubmitting} 
                type="submit"
                className="commerce-bg-1 ip-add-submit-btn">
              Add Record
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default IPTableRowAddPage
