import { Td, Tr, useToast } from '@chakra-ui/react'
import React from 'react'
import { ApplicationInfoRow } from '../../../../api/api-types'
import AppsTableRowDeleteAlert from './AppsTableRowDeleteAlert'
import AppsTableRowEditModal from './AppsTableRowEditModal'
import { User } from '../../../../api/api-types'

function AppsTableBody(row: ApplicationInfoRow, index: number, admin?: User, callback?: Function, data?: Object): React.JSX.Element {
  const [api, toast, forceReload] = (data as any).hooks;

  const handleAppEdit = (newApp: ApplicationInfoRow) => {
    if (row.app_info_description === newApp.app_info_description) {
      // no changes made
      return;
    }
    async function sendEdit() {
      const response = await api.ApplicationInfo.Update({ 
        app_uid: row.app_info_uid, 
        updated_app_info: { 
          app_info_uid: row.app_info_uid, 
          app_info_description: newApp.app_info_description 
        }, 
        requester_uid: admin!.user_uid 
      }) 
      if (!response.updated_app_info) {
        toast({
          title: `Unable to update app "${row.app_info_description}": ${response.error || "Unknown error"}`,
          status: "error",
          position: "top",
          duration: 4000,
        })
        return;
      }
      forceReload();
      toast({
        title: `Updated ${row.app_info_description} successfully`,
        status: "success",
        position: "top",
        duration: 2000,
      })
    }
    (async () => await sendEdit())();
  }

  const handleAppDelete = () => {
    async function sendDeletion() {
      const response = await api.ApplicationInfo.Delete({ 
        app_uid: row.app_info_uid,
        requester_uid: admin!.user_uid,
      }) 
      if (!response.deleted) {
        toast({
          title: `Unable to delete app "${row.app_info_description}": ${response.error || "Unknown error"}`,
          status: "error",
          position: "top",
          duration: 4000,
        })
        return;
      }
      forceReload();
      toast({
        title: `${row.app_info_description} deleted`,
        status: "warning",
        position: "top",
        duration: 2000,
      })
      return;
    }
    (async () => await sendDeletion())();
  }

  return (
    <Tr className="commerce-table-row" key={index}>
      <Td>{row.app_info_uid}</Td>
      <Td>{row.app_info_description}</Td>
      <Td className="row-action">
        <AppsTableRowEditModal
          row={row}
          onSubmit={handleAppEdit}
        />
      </Td>{/* Row for "add app" button also */}
      <Td className="row-action">
        <AppsTableRowDeleteAlert
          row={row}
          onSubmit={handleAppDelete}
        />
      </Td>
    </Tr>
  )
}

export default AppsTableBody
