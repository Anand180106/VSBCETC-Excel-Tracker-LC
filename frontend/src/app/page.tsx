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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetchStudents = async () => {
  const res = await axios.get(`${API_URL}/students/`, { headers: getAuthHeaders() })
  return res.data
}

export default function Dashboard() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [globalFilter, setGlobalFilter] = useState("")

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

  const handleImport = (data: any[]) => {
    importStudentsMutation.mutate(data)
  }

  const handleAddStudent = (data: any) => {
    addStudentMutation.mutate(data)
  }

  const handleExport = () => {
    if (!students) return
    const exportData = students.map((s: any) => ({
      Name: s.name,
      'Reg No': s.register_number,
      Dept: s.department,
      Year: s.year,
      'LeetCode ID': s.leetcode_username,
      Total: s.leetcode_stats?.total_solved || 0,
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

  const totalStudents = students?.length || 0
  const activeStudents = students?.filter((s: any) => s.is_active).length || 0
  
  let totalSolved = 0
  let totalToday = 0 
  
  students?.forEach((s: any) => {
      if (s.leetcode_stats) {
          totalSolved += s.leetcode_stats.total_solved || 0
      }
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalToday}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Students Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <TableToolbar
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              onImport={handleImport}
              onExport={handleExport}
              onAddStudent={handleAddStudent}
            />
            {isLoading ? <p>Loading...</p> : (
              <StudentsTable 
                data={students || []} 
                onUpdate={handleUpdate}
                globalFilter={globalFilter}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
