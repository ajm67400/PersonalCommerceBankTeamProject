// @ts-nocheck
import React, { useEffect, } from 'react'
import { ServerInfoRow } from '../../../../api/api-types';
import { 
  Tr,
  Td, 
  useEditableControls, 
  ButtonGroup, 
  IconButton,  
  Editable, 
  EditablePreview, 
  Input, 
  EditableInput, 
  useToast, 
  Spinner
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import KeyValueTable, { RowMapperFunc } from '../../../KeyValueTable';
import { User } from '../../../../api/api-types';
import { useCommerceToast, useServerInfo } from '../../../../hooks/api-user-hooks';

const singleViewPageStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    margin: "3em",
}

const IPTableRowSingleView = ({ user, serverId, edit }:  {
    user: User,
    serverId: number,
    edit?: boolean,
}) => {
  const toast = useToast();
  const [serverInfo, setServerInfo, error] = useServerInfo.Single(serverId);

  useEffect(() => {
    if (error) {
      toast({
        title: `Could not fetch serverinfo: ${error || "Unknown error"}`,
        isClosable: false,
        duration: 2000,
        status: "error",
        position: "top",
      })
    }
  }, [error])


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

  const handleFieldEdit = (property: keyof ServerInfoRow, value: string) => {
    if (serverInfo === null) console.error(`handleFieldEdit server info is null!`)
    const currentServerInfo: ServerInfoRow = { ...serverInfo };
    currentServerInfo[property] = value;
    setServerInfo(currentServerInfo);
  };

  const ipRowMapper: RowMapperFunc = (key: keyof ServerInfoRow) => {
    const unmodifiableRows: Array<keyof ServerInfoRow> = [
      "app_info_uid",
      "server_info_uid",
      "modified_at",
      "modified_by",
      "created_by",
      "created_at",
    ]
    const EditorField = () => {
      if (!edit) return null;
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
        const millis = Number(serverInfo[key]);
        if (!isNaN(millis)) {
          return new Date(millis).toLocaleString(); 
        }
      }
      return String(serverInfo[key]);
    }
    return (
        <Tr key={key}>
            <Td style={{maxWidth: "50px"}}>{key}</Td> 
            <Td className={edit ? "edit-cell" : "value-cell"} style={{maxWidth: "20px"}}>
              <Editable 
                style={{display: "flex", justifyContent: "space-between"}}
                textAlign="center" 
                isPreviewFocusable={false}
                onSubmit={(v) => handleFieldEdit(key as keyof ServerInfoRow, v)}             
                defaultValue={adaptValue()}>
                <EditablePreview />
                <EditorField />
              </Editable>
            </Td>
        </Tr>
    );
  }


 // Creates a vertical or "inverted" table, columns in ServerInfoRow turn into rows 
  return (
    <div style={singleViewPageStyle} className="ip-single-view">
      {
        serverInfo ? 
          <KeyValueTable obj={serverInfo} rowMapper={ipRowMapper} /> 
        : 
          <Spinner
            style={{position: "absolute", top: "30vh", left: "47vw", transform: "scale(3)"}}
            thickness='5px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
      }
    </div>
  )
}

export default IPTableRowSingleView;
