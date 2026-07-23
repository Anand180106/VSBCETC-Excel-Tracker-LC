"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("App boundary caught error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md space-y-4 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An error occurred while loading this page."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => reset()} className="bg-primary text-primary-foreground">
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
