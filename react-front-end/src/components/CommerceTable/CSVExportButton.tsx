import { Button, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { User } from "../../api/api-types";
import useApi from "../../hooks/api-hook";
import { ApiTypes } from "../../api/api-types";

function CSVExportButton<T extends Object>({ user, rowsToExport, nameFunc }: {
  user: User,
  rowsToExport: T[], 
  nameFunc?: () => string,
}) {
  const toast = useToast();
  const api = useApi();

  const [exportingCSV, setExportingCSV] = useState<boolean>(false);

  const exportToCSV = async () => {
    setExportingCSV(true);
    toast({ 
      title: `Generating CSV...`, 
      isClosable: false, 
      duration: 2000,
      status: "info",
      position: "top"
    })

    const response: ApiTypes.CSV.Response = await api.CSV.Export<T>({
      user_uid: user.user_uid,
      rows: rowsToExport,
    })
    
    if (response.error) {
      toast({ 
        title: `Error generating CSV: ${response.error || "Unknown error"}`, 
        isClosable: false, 
        duration: 2000,
        status: "error",
        position: "top"
      })
    }
    else if (response.url) { 
      toast({ 
        title: `Generated CSV Successfully`, 
        isClosable: true, 
        duration: 30000,
        status: "success",
        position: "top"
      })
      
      //
      // downloads the response url
      // 
      const link = document.createElement("a");
      link.href = response.url;
      link.download = nameFunc ? `${nameFunc()}.csv` : `table_${new Date().toLocaleDateString()}.csv`
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    }
    setExportingCSV(false);
  }
  return (
    <Button
        style={{color: "white", backgroundColor: "#006747"}}
        onClick={exportToCSV}
        isLoading={exportingCSV}
    >
        Export to CSV
    </Button>
  )
}

export default CSVExportButton
