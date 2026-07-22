"use client"

import { useRef } from "react"
import Papa from "papaparse"
import { useRouter } from "next/navigation"
import { AddStudentDialog } from "./add-student-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Download, LogOut } from "lucide-react"

interface TableToolbarProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  departmentFilter: string
  setDepartmentFilter: (value: string) => void
  departments: string[]
  selectedCount?: number
  onDeleteSelected?: () => void
  onExport: () => void
  onImport: (data: any[]) => void
  onAddStudent: (data: any) => void
}

export function TableToolbar({
  globalFilter,
  setGlobalFilter,
  departmentFilter,
  setDepartmentFilter,
  departments = [],
  selectedCount = 0,
  onDeleteSelected,
  onExport,
  onImport,
  onAddStudent,
}: TableToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onImport(results.data)
        if (fileInputRef.current) fileInputRef.current.value = ""
      },
    })
  }
  
  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
      <div className="flex items-center space-x-2 flex-1 max-w-md">
        <Input
          placeholder="Search users, Reg No, LeetCode ID..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="w-full min-w-[200px]"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="ALL">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        {selectedCount > 0 && (
          <Button 
            variant="destructive" 
            onClick={onDeleteSelected}
            className="animate-in fade-in zoom-in duration-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedCount})
          </Button>
        )}
        <AddStudentDialog onAdd={onAddStudent} />
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="ghost" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

