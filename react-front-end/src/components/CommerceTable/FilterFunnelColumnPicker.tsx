import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useState } from 'react'

export type ColumnFilterEntry<K> = { column: keyof K, displayName: string }
export type FilterDirection = "ascending" | "descending";

function FilterFunnelColumnPicker<T>({ hide, ref, columns, defaultColumn, onFilterColumnPicked }: {
    hide?: boolean,
    ref?: any,
    columns: Array<ColumnFilterEntry<T>>,
    defaultColumn: keyof T,
    onFilterColumnPicked: (column: keyof T, direction: FilterDirection) => void;
}) {
    const [selectedColumn, setSelectedColumn] = useState<keyof T>(defaultColumn);
    const [filterType, setFilterType] = useState<FilterDirection>("ascending");

    if (hide) return null;

    const onColumnFilterClicked = (column: keyof T) => {
      let direction = filterType;
      if (selectedColumn === column) {
        // If you click the same column twice in a row, you will toggle between sort by ascending and descending
        direction = direction === "ascending" ? "descending" : "ascending"
      } else {
        direction = "ascending"; // reset direction if choose different column
      }

      setFilterType(direction)
      setSelectedColumn(column);
      onFilterColumnPicked(column, direction);
    }

    // will show a note beside the name of the column (Ascending) or (Descending)
    // the mode we're on right now
    const directionInfo = (key: keyof T) => {
      if (key === selectedColumn)
        return filterType === "ascending" ? <ArrowUpIcon /> : <ArrowDownIcon />
      return null;
    };

    return (
      <div style={{display: "flex", flexDirection: "column"}} className="sort-columns">
        {columns.map((col: ColumnFilterEntry<T>, index: number) => {
          const key: keyof T = col.column;
          const keyDirectionInfo = directionInfo(key);
          return (
            <button 
              ref={index===0 ? ref : undefined}
              style={{textAlign: "left", fontSize: "1.5em", padding: "0.5em"}}
              onClick={() => onColumnFilterClicked(key)}
              key={index} 
              className="column-filter-key">
              <span>{col.displayName}</span>
              {keyDirectionInfo ? 
                <span 
                style={{fontWeight: "bold", color: "goldenrod", marginLeft: "5px", backgroundColor: keyDirectionInfo !== null ? "rgba(255, 255, 255, 0.8)" : 'white'}}>
                  {keyDirectionInfo}
                </span> 
              : null}
            </button> 
          )
        })}
      </div>
    )
}

export default FilterFunnelColumnPicker
