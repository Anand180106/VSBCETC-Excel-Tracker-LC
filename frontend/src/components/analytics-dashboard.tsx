"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Trophy, Flame, CheckCircle2, Users, Layers, Award } from "lucide-react"

interface AnalyticsDashboardProps {
  students: any[]
}

const EASY_COLOR = "#22c55e"
const MEDIUM_COLOR = "#eab308"
const HARD_COLOR = "#ef4444"

export function AnalyticsDashboard({ students = [] }: AnalyticsDashboardProps) {
  // Aggregate statistics across all users
  const stats = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : []
    let totalSolved = 0
    let totalEasy = 0
    let totalMedium = 0
    let totalHard = 0
    let totalToday = 0
    let maxStreak = 0

    const deptMap: Record<string, { total: number; today: number; count: number }> = {}

    safeStudents.forEach((s) => {
      const sStats = s.leetcode_stats || {}
      const total = sStats.total_solved || 0
      const easy = sStats.easy_solved || 0
      const med = sStats.medium_solved || 0
      const hard = sStats.hard_solved || 0
      const today = sStats.solved_today || 0
      const streak = sStats.current_streak || 0

      totalSolved += total
      totalEasy += easy
      totalMedium += med
      totalHard += hard
      totalToday += today

      if (streak > maxStreak) maxStreak = streak

      const dept = (s.department || "Other").trim().toUpperCase()
      if (!deptMap[dept]) {
        deptMap[dept] = { total: 0, today: 0, count: 0 }
      }
      deptMap[dept].total += total
      deptMap[dept].today += today
      deptMap[dept].count += 1
    })

    const deptData = Object.keys(deptMap).map((dept) => ({
      name: dept,
      Total: deptMap[dept].total,
      Today: deptMap[dept].today,
      Users: deptMap[dept].count,
    }))

    // Top 3 performers
    const sortedUsers = [...safeStudents].sort(
      (a, b) => (b.leetcode_stats?.total_solved || 0) - (a.leetcode_stats?.total_solved || 0)
    )
    const topPerformers = sortedUsers.slice(0, 3)

    // Today's active solvers
    const todaySolvers = safeStudents
      .filter((s) => (s.leetcode_stats?.solved_today || 0) > 0)
      .sort((a, b) => (b.leetcode_stats?.solved_today || 0) - (a.leetcode_stats?.solved_today || 0))

    return {
      totalSolved,
      totalEasy,
      totalMedium,
      totalHard,
      totalToday,
      maxStreak,
      deptData,
      topPerformers,
      todaySolvers,
    }
  }, [students])

  const difficultyPieData = [
    { name: "Easy", value: stats.totalEasy, color: EASY_COLOR },
    { name: "Medium", value: stats.totalMedium, color: MEDIUM_COLOR },
    { name: "Hard", value: stats.totalHard, color: HARD_COLOR },
  ]



  return (
    <div className="space-y-6">
      {/* Top Visual Cards Row */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Card 1: Solved Questions Progress Donut & Bars (5 columns) */}
        <Card className="md:col-span-6 lg:col-span-5 bg-card border border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span>Solved Questions</span>
              <span className="text-xs font-medium text-muted-foreground">LeetCode Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Gauge Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyPieData.some((d) => d.value > 0) ? difficultyPieData : [{ name: "None", value: 1, color: "#e5e7eb" }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {difficultyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-foreground">{stats.totalSolved}</span>
                  <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">Questions</span>
                </div>
              </div>

              {/* Easy / Medium / Hard Progress Bars */}
              <div className="flex-1 w-full space-y-4">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Easy</span>
                    <span className="text-foreground">{stats.totalEasy} Solved</span>
                  </div>
                  <div className="w-full bg-emerald-100 dark:bg-emerald-950/40 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalSolved ? Math.round((stats.totalEasy / stats.totalSolved) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">Medium</span>
                    <span className="text-foreground">{stats.totalMedium} Solved</span>
                  </div>
                  <div className="w-full bg-amber-100 dark:bg-amber-950/40 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalSolved ? Math.round((stats.totalMedium / stats.totalSolved) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Hard</span>
                    <span className="text-foreground">{stats.totalHard} Solved</span>
                  </div>
                  <div className="w-full bg-rose-100 dark:bg-rose-950/40 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.totalSolved ? Math.round((stats.totalHard / stats.totalSolved) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Department Performance Comparison Bar Chart (7 columns) */}
        <Card className="md:col-span-6 lg:col-span-7 bg-card border border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span>Department Analytics</span>
              <span className="text-xs font-medium text-muted-foreground">Total vs Today Solved</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {stats.deptData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none", color: "#fff" }}
                    />
                    <Legend />
                    <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Solved" />
                    <Bar dataKey="Today" fill="#10b981" radius={[4, 4, 0, 0]} name="Solved Today" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
