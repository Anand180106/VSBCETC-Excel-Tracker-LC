"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Download, LogOut } from "lucide-react"
import { useRef } from "react"
import Papa from "papaparse"
import { AddStudentDialog } from "./add-student-dialog"
import { useRouter } from "next/navigation"

interface TableToolbarProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  onExport: () => void
  onImport: (data: any[]) => void
  onAddStudent: (data: any) => void
}

export function TableToolbar({
  globalFilter,
  setGlobalFilter,
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
    <div className="flex items-center justify-between pb-4">
      <Input
        placeholder="Filter all columns..."
        value={globalFilter ?? ""}
        onChange={(event) => setGlobalFilter(String(event.target.value))}
        className="max-w-sm"
      />
      <div className="flex space-x-2">
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

