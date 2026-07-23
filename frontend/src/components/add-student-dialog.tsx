"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface AddStudentDialogProps {
  onAdd: (data: any) => void
}

export function AddStudentDialog({ onAdd }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    register_number: "",
    department: "",
    year: 1,
    section: "A",
    email: "",
    leetcode_username: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanRegNo = formData.register_number.trim().replace(/[^a-zA-Z0-9]/g, "") || "user"
    const cleanEmail = formData.email ? formData.email.trim() : `${cleanRegNo}@college.edu`
    
    onAdd({
      ...formData,
      name: formData.name.trim(),
      register_number: formData.register_number.trim(),
      department: formData.department.trim(),
      leetcode_username: formData.leetcode_username.trim(),
      email: cleanEmail
    })
    setOpen(false)
    setFormData({
      name: "",
      register_number: "",
      department: "",
      year: 1,
      section: "A",
      email: "",
      leetcode_username: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        Add Student/Staff
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Enter details to add a new student or staff to the tracker.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reg No / ID</label>
              <Input
                required
                value={formData.register_number}
                onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input
                type="number"
                min="1"
                max="4"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">LeetCode Username</label>
              <Input
                required
                value={formData.leetcode_username}
                onChange={(e) => setFormData({ ...formData, leetcode_username: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
