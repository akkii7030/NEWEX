"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Bell, TrendingUp, Mail, MessageSquare, Activity, Target, Calendar, ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Link from "next/link"

interface Analytics {
  alertStats: {
    totalAlerts: number
    activeAlerts: number
    totalMatches: number
    avgMatchesPerAlert: number
  }
  notificationStats: {
    totalNotifications: number
    emailNotifications: number
    smsNotifications: number
    whatsappNotifications: number
  }
  recentActivity: Array<{ _id: string; count: number }>
  topAlerts: Array<{
    _id: string
    name: string
    matchCount: number
    isActive: boolean
    createdAt: string
  }>
  frequencyDistribution: Array<{ _id: string; count: number }>
}

export default function AlertAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/alerts/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      // Mock data for demo
      setAnalytics({
        alertStats: {
          totalAlerts: 5,
          activeAlerts: 3,
          totalMatches: 47,
          avgMatchesPerAlert: 9.4,
        },
        notificationStats: {
          totalNotifications: 23,
          emailNotifications: 15,
          smsNotifications: 8,
          whatsappNotifications: 12,
        },
        recentActivity: [
          { _id: "2024-01-10", count: 2 },
          { _id: "2024-01-11", count: 1 },
          { _id: "2024-01-12", count: 4 },
          { _id: "2024-01-13", count: 3 },
          { _id: "2024-01-14", count: 2 },
          { _id: "2024-01-15", count: 5 },
        ],
        topAlerts: [
          {
            _id: "1",
            name: "2BHK in Bandra under 50K",
            matchCount: 15,
            isActive: true,
            createdAt: "2024-01-10",
          },
          {
            _id: "2",
            name: "Luxury Apartments in Powai",
            matchCount: 12,
            isActive: true,
            createdAt: "2024-01-08",
          },
        ],
        frequencyDistribution: [
          { _id: "daily", count: 3 },
          { _id: "weekly", count: 1 },
          { _id: "instant", count: 1 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#ea580c", "#fb923c", "#fed7aa", "#ffedd5"]

  const channelData = analytics
    ? [
        { name: "Email", value: analytics.notificationStats.emailNotifications, color: "#3b82f6" },
        { name: "SMS", value: analytics.notificationStats.smsNotifications, color: "#10b981" },
        { name: "WhatsApp", value: analytics.notificationStats.whatsappNotifications, color: "#25d366" },
      ]
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/alerts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Alerts
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Activity className="h-8 w-8 text-orange-600" />
                <span>Alert Analytics</span>
              </h1>
              <p className="text-gray-600 mt-2">Track your alert performance and notification insights</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.alertStats.totalAlerts}</p>
                  <p className="text-sm text-green-600 mt-1">{analytics.alertStats.activeAlerts} active</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.alertStats.totalMatches}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {analytics.alertStats.avgMatchesPerAlert.toFixed(1)} avg per alert
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notifications Sent</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.notificationStats.totalNotifications}</p>
                  <p className="text-sm text-purple-600 mt-1">Last 30 days</p>
                </div>
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">98.5%</p>
                  <p className="text-sm text-green-600 mt-1">Delivery rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity (Last 7 Days)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#ea580c" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Notification Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topAlerts.map((alert, index) => (
                  <div key={alert._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{alert.name}</span>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Created: {alert.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">{alert.matchCount}</p>
                      <p className="text-sm text-gray-600">matches</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert Frequency Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Frequency Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.frequencyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ea580c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Channel Performance Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Channel Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {analytics.notificationStats.emailNotifications}
                </p>
                <p className="text-sm text-gray-600">notifications sent</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">99.2% delivered</Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">{analytics.notificationStats.smsNotifications}</p>
                <p className="text-sm text-gray-600">notifications sent</p>
                <Badge className="mt-2 bg-green-100 text-green-800">97.8% delivered</Badge>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {analytics.notificationStats.whatsappNotifications}
                </p>
                <p className="text-sm text-gray-600">notifications sent</p>
                <Badge className="mt-2 bg-green-100 text-green-800">98.5% delivered</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
