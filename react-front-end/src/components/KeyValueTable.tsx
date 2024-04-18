import { Table, Thead, TableContainer, Tbody, Tr, Th, } from '@chakra-ui/react'
import React from 'react'

const singleViewTableStyle: React.CSSProperties = {
    width: "60vmax"
};

export type RowMapperFunc = <T>(key: keyof T) => React.JSX.Element; 

// Converts all fields within an object into rows of a Table
const KeyValueTable = <T extends Object>({ obj, rowMapper, keyName, valueName }: {
  obj: T,
  rowMapper: RowMapperFunc,
  keyName?: string,
  valueName?: string,
}) => {
  return (
      <TableContainer style={singleViewTableStyle}>
        <Table align='center' variant="striped" colorScheme='blackAlpha'>
            <Thead>
                <Tr style={{height: "50px"}}>
                    <Th>{ keyName || "Property" }</Th>
                    <Th>{ valueName || "Value" }</Th>
                </Tr>
            </Thead>
            <Tbody>    
                {Object.keys(obj).map(rowMapper)}
            </Tbody>
        </Table>
      </TableContainer>
  )
}

export default KeyValueTable
