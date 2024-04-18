import { useState } from 'react';
import { ColumnFilterEntry, FilterDirection } from './FilterFunnelColumnPicker';
import { Input, Table, TableContainer, Tbody, Thead, } from '@chakra-ui/react';
import { User } from '../../api/api-types';
import CSVExportButton from './CSVExportButton';
import FilterFunnel from './FilterFunnel';
import "./CommerceTable.scss";
import { SearchIcon } from '@chakra-ui/icons';


function CommerceTable<T extends Object>({ 
    user,
    contextUser,
    tableData,
    filterableColumns, 
    tableRowSource, 
    tableHead,
    tableBodyCallbackHandler,
    tableBodyBuilder,
    noFiltering,
    noSorting,
    csvExport,
    csvExportNameFunc,
    overflow,
}: {
  user: User,
  filterableColumns: Array<ColumnFilterEntry<T>>,
  tableRowSource: Array<T>,
  tableHead: React.JSX.Element,
  tableBodyCallbackHandler?: (data: Object, rows: Array<T>, setRows: Function) => void,
  tableBodyBuilder: (row: T, index: number, user?: User, callback?: (data: Object) => void, data?: Object) => React.JSX.Element,
  contextUser?: User,
  tableData?: Object,
  noFiltering?: boolean,
  noSorting?: boolean,
  csvExport?: boolean,
  csvExportNameFunc?: () => string,
  overflow?: boolean,
}) {
  // holds table rows
  const [rows, setRows] = useState<Array<T>>(tableRowSource)
  const [filteredRows, setFilteredRows] = useState<Array<T>>([])

  // for displaying to user what our selected options are. We dont actually sort/filter the table in this component
  const [filtering, setFiltering] = useState<boolean>(false);
  const [sorted, setSorted] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<keyof T>(filterableColumns[0].column);
  const [sortDirection, setSortDirection] = useState<FilterDirection>("ascending");

  const handleTableBodyCallback = (data: Object) => {
    if (tableBodyCallbackHandler) tableBodyCallbackHandler(data, filtering ? filteredRows : rows, filtering ? setFilteredRows : setRows); 
  }

  const sortFunnelAppliedCallback = (column: keyof T, direction: FilterDirection) => {
    // runs when you click the funnel icon and select a column to filter on 
    setSorted(true) // table is "sorted by" server uid by default, since that is the order given to us by database 
    setSortColumn(column)
    setSortDirection(direction);
  }

  const handleManualInputFiltering = (value: string) => {
        // runs when you type query into "Search" textbox above table
    value = value.trim().toLowerCase();
    if (!value.length) {
      setFiltering(false)
      return;
    }
    setFiltering(true);

    const rowShouldBeIncluded = (row: T) => {
      return Object.keys(row)
                .map((key: string) => row[key as keyof T])
                .filter(column => String(column).toLowerCase().includes(value))
                .length>0;
    }
    setFilteredRows(rows.filter(rowShouldBeIncluded))
  }


  return (
    <TableContainer className='commerce-table'>
        <div className="commerce-table-actions">
            {!noSorting || !noFiltering ? 
                <div className="commerce-table-filtering">
                    {noSorting ? null : 
                        <FilterFunnel 
                            rows={filtering ? filteredRows : rows} 
                            setRows={filtering ? setFilteredRows : setRows} 
                            onFilterApplied={sortFunnelAppliedCallback}
                            columnFilterChoices={filterableColumns}
                        />
                    }
                    {noFiltering ? null : 
                    <div style={{display: "flex", alignItems: "center"}} className="filtering-wrapper">
                        {noSorting ? <SearchIcon marginRight={"5px"} filter={"contrast(20%)"} /> : null}
                        <Input 
                            className="commerce-table-search"
                            onChange={(e) => handleManualInputFiltering(e.target.value)} 
                            placeholder={"Search"} 
                        />
                    </div>
                    }
                </div>
            : null}
            <div className="commerce-table-export">
                {filtering ? <span style={{fontWeight: "bold", color: "goldenrod", marginRight: "2em"}}>* Filtered</span> : null}
                {sorted ? <span style={{fontWeight: "bold", color: "goldenrod", marginRight: "2em"}}>* Sorted on column {sortColumn as string} ({sortDirection})</span> : null}
                {csvExport ?  
                    <CSVExportButton 
                        user={user}
                        rowsToExport={filtering ? filteredRows : rows}
                        nameFunc={csvExportNameFunc}
                    />
                : null}
            </div>
        </div>
        <Table align='center' variant="striped" colorScheme="blackAlpha">
            <Thead className="commerce-table-thead">
                {tableHead}
            </Thead>
            <Tbody>
                {filtering ? 
                        filteredRows.map((r: T, index: number) => tableBodyBuilder(r, index, contextUser, handleTableBodyCallback, tableData)) : 
                        rows.map((r: T, index: number) => tableBodyBuilder(r, index, contextUser, handleTableBodyCallback, tableData))
                }
            </Tbody>
        </Table>
    </TableContainer>
  )
}

export default CommerceTable;
