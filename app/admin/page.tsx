"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCurrentUser,
  getUsers,
  getTransactions,
  updateUserBalance,
  logout,
  type User,
  type Transaction,
} from "@/lib/auth"
import { LogOut, Users, ShoppingCart, Package } from "lucide-react"

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [balanceAmount, setBalanceAmount] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser()
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      setCurrentUser(user)
      await loadData()
    }
    checkUser()
  }, [router])

  const loadData = async () => {
    const usersData = await getUsers()
    setUsers(usersData)
    const transactionsData = await getTransactions()
    setTransactions(transactionsData)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleAddBalance = async () => {
    if (!selectedUserId || !balanceAmount) return
    const user = users.find((u) => u.id === selectedUserId)
    if (!user) return

    const newBalance = user.balance + Number.parseFloat(balanceAmount)
    await updateUserBalance(selectedUserId, newBalance)
    setBalanceAmount("")
    setSelectedUserId("")
    await loadData()
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0)
  const totalTransactions = transactions.length

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Backoffice</h1>
            <p className="text-slate-400">SNecc-Bar Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-white font-medium">{currentUser.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Users</CardTitle>
              <Users className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Transactions</CardTitle>
              <ShoppingCart className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalTransactions}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">Total Revenue</CardTitle>
              <Package className="w-4 h-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">€{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="balance">Manage Balance</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-400">View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Balance</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Necc Member</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50">
                          <td className="py-3 px-4 text-white">{user.name}</td>
                          <td className="py-3 px-4 text-slate-300">{user.email}</td>
                          <td className="py-3 px-4 text-white">€{user.balance.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.role === "admin" ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{user.isNeccMember ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription className="text-slate-400">View all vending machine transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Items</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Total</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">For Someone Else</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((transaction) => {
                          const user = users.find((u) => u.id === transaction.userId)
                          return (
                            <tr key={transaction.id} className="border-b border-slate-700/50">
                              <td className="py-3 px-4 text-slate-300">
                                {new Date(transaction.timestamp).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-white">{user?.name || "Unknown"}</td>
                              <td className="py-3 px-4 text-slate-300">
                                {transaction.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                              </td>
                              <td className="py-3 px-4 text-white">€{transaction.total.toFixed(2)}</td>
                              <td className="py-3 px-4 text-slate-300">
                                {transaction.isForSomeoneElse ? "Yes" : "No"}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Management Tab */}
          <TabsContent value="balance">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Manage User Balance</CardTitle>
                <CardDescription className="text-slate-400">Add balance to user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Select User</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white"
                    >
                      <option value="">Choose a user...</option>
                      {users
                        .filter((u) => u.role !== "admin")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} - Current: €{user.balance.toFixed(2)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Amount to Add (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <Button onClick={handleAddBalance} className="w-full bg-cyan-500 hover:bg-cyan-600">
                    Add Balance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
