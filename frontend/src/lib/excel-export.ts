/**
 * Styled Excel Report Exporter for V.S.B. College LeetCode Tracker
 * Features:
 * 1. Automatic Column Width calculation so names like "Anandamirtharaj" & long headers are never truncated.
 * 2. Styled Header Row with V.S.B. Brand Colors (Dark Navy `#31395B` / Orange `#F48024`) and bold white text.
 * 3. Formatted data rows with alternating light background colors for executive presentation.
 */

export function exportStyledExcelReport(students: any[]) {
  if (!students || students.length === 0) return

  const headers = [
    { label: "Name", key: "name", minWidth: 220 },
    { label: "Register Number", key: "register_number", minWidth: 160 },
    { label: "Department", key: "department", minWidth: 120 },
    { label: "Year", key: "year", minWidth: 80 },
    { label: "LeetCode ID", key: "leetcode_username", minWidth: 180 },
    { label: "Total Solved", key: "total_solved", minWidth: 130 },
    { label: "Solved Today", key: "solved_today", minWidth: 130 },
    { label: "Easy Solved", key: "easy_solved", minWidth: 120 },
    { label: "Medium Solved", key: "medium_solved", minWidth: 140 },
    { label: "Hard Solved", key: "hard_solved", minWidth: 120 },
    { label: "Current Streak", key: "current_streak", minWidth: 130 },
  ]

  // Calculate dynamic column widths based on maximum text length
  const colWidths = headers.map((h) => {
    let maxLen = h.label.length
    students.forEach((s) => {
      let val = ""
      if (h.key === "total_solved") val = String(s.leetcode_stats?.total_solved || 0)
      else if (h.key === "solved_today") val = String(s.leetcode_stats?.solved_today || 0)
      else if (h.key === "easy_solved") val = String(s.leetcode_stats?.easy_solved || 0)
      else if (h.key === "medium_solved") val = String(s.leetcode_stats?.medium_solved || 0)
      else if (h.key === "hard_solved") val = String(s.leetcode_stats?.hard_solved || 0)
      else if (h.key === "current_streak") val = String(s.leetcode_stats?.current_streak || 0)
      else val = String(s[h.key] || "")

      if (val.length > maxLen) maxLen = val.length
    })
    // 1 char approx 9px + padding
    return Math.max(h.minWidth, maxLen * 11 + 30)
  })

  // Build HTML table format suitable for Excel (.xls / .xlsx) with rich CSS styling
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>User LeetCode Report</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        table {
          border-collapse: collapse;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        th {
          background-color: #31395B;
          color: #FFFFFF;
          font-weight: bold;
          font-size: 13px;
          text-align: center;
          vertical-align: middle;
          border: 1px solid #1E293B;
          padding: 10px 14px;
        }
        td {
          border: 1px solid #CBD5E1;
          padding: 8px 12px;
          font-size: 12px;
          color: #1E293B;
          vertical-align: middle;
        }
        .alt-row {
          background-color: #F8FAFC;
        }
        .num-col {
          text-align: right;
          mso-number-format: "\#\,\#\#0";
        }
        .highlight-today {
          background-color: #DCFCE7;
          color: #15803D;
          font-weight: bold;
        }
        .brand-header {
          background-color: #F48024;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          padding: 12px;
        }
      </style>
    </head>
    <body>
      <table>
        <colGroup>
          ${colWidths.map((w) => `<col style="width: ${w}px;" />`).join("\n")}
        </colGroup>
        <thead>
          <tr>
            <th colspan="${headers.length}" class="brand-header">
              V.S.B. College of Engineering Technical Campus - LeetCode Analytics Report (${new Date().toLocaleDateString()})
            </th>
          </tr>
          <tr>
            ${headers.map((h) => `<th>${h.label}</th>`).join("\n")}
          </tr>
        </thead>
        <tbody>
  `

  students.forEach((s, idx) => {
    const isAlt = idx % 2 === 1 ? 'class="alt-row"' : ""
    const stats = s.leetcode_stats || {}
    const solvedToday = stats.solved_today || 0

    html += `
      <tr ${isAlt}>
        <td style="font-weight: 600;">${s.name || ""}</td>
        <td style="mso-number-format:'\\@';">${s.register_number || ""}</td>
        <td>${s.department || ""}</td>
        <td class="num-col">${s.year || ""}</td>
        <td style="color: #2563EB;">${s.leetcode_username || ""}</td>
        <td class="num-col" style="font-weight: bold;">${stats.total_solved || 0}</td>
        <td class="num-col ${solvedToday > 0 ? "highlight-today" : ""}">${solvedToday > 0 ? "+" + solvedToday : 0}</td>
        <td class="num-col" style="color: #16A34A;">${stats.easy_solved || 0}</td>
        <td class="num-col" style="color: #D97706;">${stats.medium_solved || 0}</td>
        <td class="num-col" style="color: #DC2626;">${stats.hard_solved || 0}</td>
        <td class="num-col">${stats.current_streak || 0} days</td>
      </tr>
    `
  })

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `VSB_LeetCode_Report_${new Date().toISOString().split("T")[0]}.xls`
  link.click()
}
