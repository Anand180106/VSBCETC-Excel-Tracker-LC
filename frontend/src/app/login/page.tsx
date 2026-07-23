"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = rawApiUrl.replace(/\/+$/, "")

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
        },
        timeout: 15000
      })
      
      if (res.data && res.data.access_token) {
        localStorage.setItem("token", res.data.access_token)
        router.push("/")
      } else {
        setError("Login response missing access token.")
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Login attempt failed:", err)
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        setError(typeof detail === "string" ? detail : JSON.stringify(detail))
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError(`Failed to connect to backend server (${API_URL}). Please verify your backend server is active and CORS is configured.`)
      } else {
        setError(err.message || "Login failed. Please verify credentials.")
      }
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
            <div className="w-48 h-48 bg-white rounded-2xl shadow-md border border-gray-100 p-3 flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="V.S.B. College of Engineering Technical Campus Logo" 
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
            <div className="flex flex-col space-y-1">
              <label className="text-sm text-gray-600 font-medium">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="border-0 border-b-2 border-gray-300 rounded-none px-1 py-2 text-slate-900 placeholder:text-gray-400 font-medium text-base shadow-none focus-visible:ring-0 focus-visible:border-orange-500 bg-transparent"
              />
            </div>
            
            <div className="flex flex-col space-y-1 pt-2">
              <label className="text-sm text-gray-600 font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="border-0 border-b-2 border-gray-300 rounded-none px-1 py-2 text-slate-900 placeholder:text-gray-400 font-medium text-base shadow-none focus-visible:ring-0 focus-visible:border-orange-500 bg-transparent"
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
