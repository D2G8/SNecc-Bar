'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Users, ShoppingCart, Package } from "lucide-react"
import { getCurrentUser, getUsers, getTransactions, getProducts, updateUserBalance, updateProductStock, logout } from "@/lib/auth"

type User = {
  id: string
  name: string
  email: string
  role: string
  balance: number
  isNeccMember: boolean
}

type Transaction = {
  id: string
  userId: string
  items: { name: string; quantity: number }[]
  total: number
  timestamp: string
  isForSomeoneElse: boolean
}

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [balanceAmount, setBalanceAmount] = useState<string>("")
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [stockAmount, setStockAmount] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser()
      if (!user || user.role !== "admin") {
        router.push("/login")
        return
      }
      setCurrentUser(user)
      loadData()
    }
    checkUser()
  }, [router])

  const loadData = async () => {
    // Replace these with your actual data fetching functions
    const usersData = await getUsers()
    setUsers(usersData)
    setTransactions(getTransactions())
    setProducts(getProducts())
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleAddBalance = () => {
    if (!selectedUserId || !balanceAmount) return
    const user = users.find((u) => u.id === selectedUserId)
    if (!user) return

    const newBalance = user.balance + Number.parseFloat(balanceAmount)
    updateUserBalance(selectedUserId, newBalance)
    setBalanceAmount("")
    setSelectedUserId("")
    loadData()
  }

  const handleUpdateStock = () => {
    if (!selectedProductId || !stockAmount) return
    const newStock = Number.parseInt(stockAmount)
    if (newStock < 0) return

    updateProductStock(selectedProductId, newStock)
    setStockAmount("")
    setSelectedProductId("")
    loadData()
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
            <TabsTrigger value="stock">Stock Management</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Users</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Balance</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">NECC Member</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-700">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">€{user.balance.toFixed(2)}</td>
                        <td className="p-2">{user.role}</td>
                        <td className="p-2">{user.isNeccMember ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Items</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">For Someone Else</th>
                      <th className="text-left p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-slate-700">
                        <td className="p-2">{users.find(u => u.id === transaction.userId)?.name || "Unknown"}</td>
                        <td className="p-2">
                          {transaction.items.map((item, index) => (
                            <div key={index}>{item.name} x{item.quantity}</div>
                          ))}
                        </td>
                        <td className="p-2">€{transaction.total.toFixed(2)}</td>
                        <td className="p-2">{transaction.isForSomeoneElse ? "Yes" : "No"}</td>
                        <td className="p-2">{new Date(transaction.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Balance Management Tab */}
          <TabsContent value="balance">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Manage Balance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="bg-slate-700 text-white border-slate-600"
                />
                <Button onClick={handleAddBalance} className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Add Balance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Management Tab */}
          <TabsContent value="stock">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200">Stock Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2 bg-slate-700 text-white border border-slate-600 rounded"
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Current: {product.stock})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="New Stock Amount"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(e.target.value)}
                  className="bg-slate-700 text-white border-slate-600"
                />
                <Button onClick={handleUpdateStock} className="w-full bg-cyan-500 hover:bg-cyan-600">
                  Update Stock
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
