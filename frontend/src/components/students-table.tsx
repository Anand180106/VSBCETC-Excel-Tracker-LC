"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from "@tanstack/react-table"
import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

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
      className="h-8 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary w-full p-1"
    />
  )
}

export function StudentsTable({ 
  data, 
  onUpdate, 
  globalFilter,
}: { 
  data: any[];
  onUpdate: (id: number, field: string, value: any) => void;
  globalFilter: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
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
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        const studentId = data[rowIndex].id
        onUpdate(studentId, columnId, value)
      },
    },
  })

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
