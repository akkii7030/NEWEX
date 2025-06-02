"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, User, LogOut, Bell } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [alertCount, setAlertCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchAlertCount()
  }, [])

  const fetchAlertCount = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const alerts = await response.json()
        setAlertCount(alerts.filter((alert: any) => alert.isActive).length)
      }
    } catch (error) {
      console.error("Error fetching alert count:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={user?.role === "admin" ? "/cp-dashboard" : "/my-inventories"}
            className="flex items-center space-x-2"
          >
            <Building2 className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">RealEstate Pro</span>
          </Link>

          {/* Navigation - Only 5 items as requested */}
          <div className="flex items-center space-x-4">
            <Link href="/cp-dashboard">
              <Button variant="ghost" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 font-medium">
                CP Dashboard
              </Button>
            </Link>

            <Link href="/my-inventories">
              <Button variant="ghost" className="text-white bg-orange-600 hover:bg-orange-700 font-medium px-6">
                My Inventories
              </Button>
            </Link>

            {/* Admin Panel Link - Only visible to admins */}
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="ghost" className="text-gray-600 hover:text-orange-600 hover:bg-orange-50 font-medium">
                  Admin Panel
                </Button>
              </Link>
            )}

            {/* User Icon */}
            <Link href="/profile">
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>

            {/* Logout Button */}
            <Button onClick={handleLogout} className="bg-orange-600 hover:bg-orange-700 text-white font-medium">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
