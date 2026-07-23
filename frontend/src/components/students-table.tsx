"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  RowSelectionState,
} from "@tanstack/react-table"
import { useState, useEffect, useMemo, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from "lucide-react"

const EditableCell = ({ getValue, row, column, table }: any) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue)
  
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    if (value !== initialValue) {
      table.options.meta?.updateData(row.index, column.id, value)
    }
  }

  return (
    <Input
      value={value || ""}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      className="h-8 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary w-full p-1 text-sm"
    />
  )
}

export function StudentsTable({ 
  data, 
  onUpdate, 
  onDeleteSingle,
  onSelectionChange,
  globalFilter,
  departmentFilter = "ALL",
}: { 
  data: any[];
  onUpdate: (id: number, field: string, value: any) => void;
  onDeleteSingle?: (id: number) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
  globalFilter: string;
  departmentFilter?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const displayData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : []
    if (!departmentFilter || departmentFilter === "ALL") return safeData;
    return safeData.filter(item => String(item.department || "").trim().toUpperCase() === departmentFilter.trim().toUpperCase());
  }, [data, departmentFilter]);

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-orange-500"
        />
      ),
      cell: ({ row }: any) => (
        <div className="px-1 flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-orange-500"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: EditableCell,
    },
    {
      accessorKey: "register_number",
      header: "Reg No",
      cell: EditableCell,
    },
    {
      accessorKey: "department",
      header: "Dept",
      cell: EditableCell,
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: EditableCell,
    },
    {
      accessorKey: "leetcode_username",
      header: "LeetCode ID",
      cell: EditableCell,
    },
    {
      id: "total_solved",
      accessorFn: (row: any) => row.leetcode_stats?.total_solved || 0,
      header: "Total",
    },
    {
      id: "solved_today",
      accessorFn: (row: any) => row.leetcode_stats?.solved_today || 0,
      header: "Solved Today",
      cell: ({ getValue }: any) => {
        const val = getValue() || 0;
        return (
          <span className={`font-semibold px-2 py-0.5 rounded text-xs inline-block ${val > 0 ? "bg-emerald-500/15 text-emerald-600 font-bold dark:text-emerald-400" : "text-muted-foreground"}`}>
            +{val}
          </span>
        )
      }
    },
    {
      id: "easy",
      accessorFn: (row: any) => row.leetcode_stats?.easy_solved || 0,
      header: "Easy",
    },
    {
      id: "medium",
      accessorFn: (row: any) => row.leetcode_stats?.medium_solved || 0,
      header: "Medium",
    },
    {
      id: "hard",
      accessorFn: (row: any) => row.leetcode_stats?.hard_solved || 0,
      header: "Hard",
    },
    {
      id: "streak",
      accessorFn: (row: any) => row.leetcode_stats?.current_streak || 0,
      header: "Streak",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteSingle && onDeleteSingle(row.original.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          title="Delete User"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        const studentId = displayData[rowIndex]?.id
        if (studentId) {
          onUpdate(studentId, columnId, value)
        }
      },
    },
  })

  // Notify parent of selected row IDs when selection changes
  const selectedIdsStr = useMemo(() => {
    const selectedIndices = Object.keys(rowSelection).filter(key => rowSelection[key])
    return selectedIndices.map(idx => displayData[Number(idx)]?.id).filter(Boolean).join(",")
  }, [rowSelection, displayData])

  const prevSelectedIdsStrRef = useRef<string | null>(null)

  useEffect(() => {
    if (!onSelectionChange) return
    if (prevSelectedIdsStrRef.current === selectedIdsStr) return
    prevSelectedIdsStrRef.current = selectedIdsStr

    const selectedIds = selectedIdsStr ? selectedIdsStr.split(",").map(Number) : []
    onSelectionChange(selectedIds)
  }, [selectedIdsStr, onSelectionChange])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort()
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div 
                        className={`flex items-center space-x-2 ${isSortable ? "cursor-pointer select-none" : ""}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {isSortable && (
                          <span className="w-4 h-4">
                            {{
                              asc: <ArrowUp className="w-3 h-3" />,
                              desc: <ArrowDown className="w-3 h-3" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-1">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
