"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, CheckCircle, Code } from "lucide-react"
import { StudentsTable } from "@/components/students-table"
import { TableToolbar } from "@/components/table-toolbar"
import { useState, useEffect } from "react"
import Papa from "papaparse"
import { useRouter } from "next/navigation"

import { exportStyledExcelReport } from "@/lib/excel-export"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = rawApiUrl.replace(/\/+$/, "")

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchStudents = async () => {
  const res = await axios.get(`${API_URL}/students/`, { headers: getAuthHeaders() })
  return Array.isArray(res.data) ? res.data : []
}

export default function Dashboard() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("ALL")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const { data: students, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    retry: false
  })

  useEffect(() => {
    if (error && (error as any).response?.status === 401) {
      localStorage.removeItem("token")
      router.push("/login")
    }
  }, [error, router])

  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number, field: string, value: any }) => {
      return axios.put(`${API_URL}/students/${id}`, { [field]: value }, { headers: getAuthHeaders() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    }
  })

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      return axios.delete(`${API_URL}/students/${id}`, { headers: getAuthHeaders() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setSelectedIds([])
    }
  })

  const bulkDeleteStudentsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return axios.post(`${API_URL}/students/bulk-delete`, ids, { headers: getAuthHeaders() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setSelectedIds([])
    }
  })

  const importStudentsMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const payload = data.map(row => ({
        name: row.Name || row.name,
        register_number: row['Reg No'] || row.register_number,
        department: row.Dept || row.department,
        year: parseInt(row.Year || row.year) || 1,
        section: row.Section || row.section || "A",
        email: row.Email || row.email || `${row['Reg No'] || row.register_number}@college.edu`,
        leetcode_username: row['LeetCode ID'] || row.leetcode_username,
      })).filter(s => s.name && s.register_number && s.leetcode_username)

      return axios.post(`${API_URL}/students/bulk-import`, payload, { headers: getAuthHeaders() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    }
  })

  const addStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(`${API_URL}/students/`, data, { headers: getAuthHeaders() })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    }
  })

  const handleUpdate = (id: number, field: string, value: any) => {
    updateStudentMutation.mutate({ id, field, value })
  }

  const handleDeleteSingle = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteStudentMutation.mutate(id)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected user(s)?`)) {
      bulkDeleteStudentsMutation.mutate(selectedIds)
    }
  }

  const handleImport = (data: any[]) => {
    importStudentsMutation.mutate(data)
  }

  const handleAddStudent = (data: any) => {
    addStudentMutation.mutate(data)
  }

  const safeStudents = Array.isArray(students) ? students : []

  const departments = Array.from(
    new Set(safeStudents.map((s: any) => s.department).filter(Boolean))
  ) as string[]

  const handleExport = () => {
    if (safeStudents.length === 0) return
    const exportData = safeStudents.map((s: any) => ({
      Name: s.name,
      'Reg No': s.register_number,
      Dept: s.department,
      Year: s.year,
      'LeetCode ID': s.leetcode_username,
      Total: s.leetcode_stats?.total_solved || 0,
      'Solved Today': s.leetcode_stats?.solved_today || 0,
      Easy: s.leetcode_stats?.easy_solved || 0,
      Medium: s.leetcode_stats?.medium_solved || 0,
      Hard: s.leetcode_stats?.hard_solved || 0,
      Streak: s.leetcode_stats?.current_streak || 0,
    }))
    
    const csv = Papa.unparse(exportData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "leetcode_tracker_export.csv"
    link.click()
  }

  const totalStudents = safeStudents.length
  const activeStudents = safeStudents.filter((s: any) => s.is_active).length
  
  let totalSolved = 0
  let totalToday = 0 
  
  safeStudents.forEach((s: any) => {
      if (s.leetcode_stats) {
          totalSolved += s.leetcode_stats.total_solved || 0
          totalToday += s.leetcode_stats.solved_today || 0
      }
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 dark:bg-background min-h-screen">
      <div className="flex items-center justify-between space-y-2 border-b border-border pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105">
            <img 
              src="/logo.png" 
              alt="V.S.B. College Logo" 
              className="h-full w-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">V.S.B. College of Engineering Technical Campus</h2>
            <p className="text-xs text-muted-foreground font-medium">LeetCode Progress Monitoring & Analytics System</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalSolved}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{totalToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard with Donut Chart, Difficulty Breakdown & Contribution Grid */}
      <AnalyticsDashboard students={safeStudents} />

      {/* User Overview Table Section */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="col-span-1 shadow-sm border-border/70">
          <CardHeader>
            <CardTitle className="text-xl font-bold">User Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <TableToolbar
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              departments={departments}
              selectedCount={selectedIds.length}
              onDeleteSelected={handleDeleteSelected}
              onImport={handleImport}
              onExport={handleExport}
              onAddStudent={handleAddStudent}
            />
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <StudentsTable 
                data={safeStudents} 
                onUpdate={handleUpdate}
                onDeleteSingle={handleDeleteSingle}
                onSelectionChange={setSelectedIds}
                globalFilter={globalFilter}
                departmentFilter={departmentFilter}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
