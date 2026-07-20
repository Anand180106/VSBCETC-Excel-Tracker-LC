"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      
      const res = await axios.post(`${API_URL}/auth/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      localStorage.setItem("token", res.data.access_token)
      router.push("/")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-[#f8f9fa]">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center p-8 md:w-1/2 lg:w-[45%]">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-10">
            {/* The user will drop their logo here */}
            <div className="h-32 w-32 bg-white rounded-lg shadow-sm border border-gray-100 p-2 flex items-center justify-center mb-6 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="VSB College Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>';
                }}
              />
            </div>
            
            <h1 className="text-3xl font-normal text-[#333333] tracking-tight">Admin/Staff Login</h1>
            
            <p className="text-xs text-gray-500 mt-6 text-center">
              (For better experience use Google Chrome 60 and above)
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 relative">
              <label className="text-sm text-gray-500 font-medium absolute -top-2 left-0">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-0 border-b border-gray-300 rounded-none px-0 py-2 pt-6 shadow-none focus-visible:ring-0 focus-visible:border-orange-500 bg-transparent"
              />
            </div>
            
            <div className="space-y-2 relative pt-4">
              <label className="text-sm text-gray-500 font-medium absolute top-2 left-0">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-0 border-b border-gray-300 rounded-none px-0 py-2 pt-6 shadow-none focus-visible:ring-0 focus-visible:border-orange-500 bg-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex justify-between items-center text-sm pt-2">
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Forgot Password?</a>
              <a href="#" className="text-gray-500 hover:text-gray-800 transition-colors">Get Activation Link</a>
            </div>

            <div className="pt-6 flex justify-center">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-1/2 bg-[#f48024] hover:bg-[#d9701d] text-white font-semibold py-6 text-lg rounded-md shadow-sm transition-all"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Brand Image (Hidden on small screens) */}
      <div 
        className="hidden md:flex w-full flex-col justify-center p-12 md:w-1/2 lg:w-[55%] relative"
        style={{
          backgroundColor: "#31395b",
          backgroundImage: "url('/bg-pattern.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay"
        }}
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-[#31395b]/80"></div>
        
        <div className="relative z-10 max-w-xl pl-8">
          <h2 className="text-white font-bold text-4xl mb-4 tracking-tight">Welcome to</h2>
          <h1 className="text-white text-5xl leading-tight">
            VSB College of Engineering & Technical Campus
          </h1>
        </div>
      </div>
    </div>
  )
}
