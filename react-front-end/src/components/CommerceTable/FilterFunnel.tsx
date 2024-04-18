import { forwardRef, useRef, useState } from 'react';
import FilterFunnelColumnPicker, { FilterDirection, ColumnFilterEntry } from './FilterFunnelColumnPicker';
import {
  Popover,
  Portal,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Button,
  useDisclosure,
  PopoverAnchor,
} from '@chakra-ui/react'
import "./FilterFunnel.scss";

// controls filtering for a table on specific columns
function FilterFunnel<T>({ rows, setRows, columnFilterChoices, onFilterApplied }: {
    rows: Array<T>,
    setRows: Function,
    columnFilterChoices: Array<ColumnFilterEntry<T>>,
    onFilterApplied?: (c: keyof T, d: FilterDirection) => void,
}) {
  const { onOpen, onClose, isOpen, onToggle } = useDisclosure()
  const [statusText, setStatusText] = useState<string>('default');

  if (!rows) return null;
  if (!columnFilterChoices) return null;
  
  const sortTableBasedOnColumn = (column: keyof T, direction: FilterDirection) => {
    if (!setRows) {
      console.warn("No setRows provided for filter funnel, can't sort table")
      return;
    }
    const sortMode = direction || "ascending";
    const sortedRows = [...rows]
        .sort((a: T, b: T) => {
          if (a[column] < b[column]) return sortMode === "ascending" ? -1 : 1;
          if (a[column] > b[column]) return sortMode === "ascending" ? 1 : -1;
          return 0;
        });
    setRows(sortedRows);
    setStatusText(`${String(column)} (${direction})`)
    if (onFilterApplied) onFilterApplied(column, direction)
  }


  return (
    <>
      <Popover  
        isOpen={isOpen}
        placement='right-start'
        onOpen={onOpen}
        onClose={onClose}
      >
        <PopoverTrigger>
          <div className="filter-funnel">
            <img className="filter-funnel-icon" src="/filter-filled.svg" />
          </div>
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverHeader borderBottom={"#4fa800"}>Choose column to sort on</PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody>
              <FilterFunnelColumnPicker
                columns={columnFilterChoices}
                defaultColumn={columnFilterChoices[0].column}
                onFilterColumnPicked={sortTableBasedOnColumn}
              />
            </PopoverBody>
            <PopoverFooter>Current: {statusText}</PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  )
}

export default FilterFunnel
