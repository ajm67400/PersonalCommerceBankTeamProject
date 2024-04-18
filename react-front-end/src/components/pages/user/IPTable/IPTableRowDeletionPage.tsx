import { useNavigate } from 'react-router-dom'
import IPTableRowSingleView from './IPTableRowSingleView'
import { Button, ButtonGroup, useToast } from '@chakra-ui/react'
import { ApiTypes } from '../../../../api/api-types';
import useApi from '../../../../hooks/api-hook';
import { DeleteIcon } from '@chakra-ui/icons';
import { User } from '../../../../api/api-types';

const IPTableRowDeletionPage = ({ user, serverId }: {
    user: User,
    serverId: number,
}) => {
  const toast = useToast();
  const api = useApi();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const response: ApiTypes.ServerInfo.Delete.Response = await api.ServerInfo.Delete({ server_info_uid: serverId, user_uid: user.user_uid }) 
    if (response.error) {
        // TODO handle error properly
        console.log(response.error)
        toast({ 
            title: "Error deleting row", 
            isClosable: false, 
            duration: 2000,
            status: "error",
            position: "top"
        })
        return;
    }
    toast({ 
        title: "Row deleted", 
        isClosable: false, 
        duration: 2000,
        status: "warning",
        position: "top"
    })
    navigate("/user/ip-table");
  }
  const handleCancel = () => {
    navigate("/user/ip-table");
  }
  return (
    <div style={{display: "flex", flexDirection: "column", textAlign: "center", marginTop: "1em"}} className='ip-row-deletion-confirmation'>
        <h2 style={{fontSize: "2em"}}>Are you sure you want to delete this record?</h2>
        <div style={{margin: "1em"}} className='choice-selection'>
            <ButtonGroup>
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button style={{backgroundColor: "red", color: "white"}} onClick={handleDelete}>
                        <DeleteIcon style={{marginRight: "0.4em"}} /> Delete Forever
                    </Button>
            </ButtonGroup>
        </div>
        <IPTableRowSingleView user={user} serverId={serverId} />
    </div>
  )
}

export default IPTableRowDeletionPage
