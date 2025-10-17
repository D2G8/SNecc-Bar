export interface User {
  id: string
  email: string
  name: string
  balance: number
  role: "user" | "admin"
  isNeccMember: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
  total: number
  isForSomeoneElse: boolean
  isNeccMember: boolean
  timestamp: string
}

const USERS_KEY = "vending_users"
const TRANSACTIONS_KEY = "vending_transactions"
const CURRENT_USER_KEY = "vending_current_user"

// Initialize with default admin user
export function initializeAuth() {
  const users = getUsers()
  if (users.length === 0) {
    const adminUser: User = {
      id: "1",
      email: "admin@necc.com",
      name: "Admin",
      balance: 1000,
      role: "admin",
      isNeccMember: true,
      createdAt: new Date().toISOString(),
    }
    saveUsers([adminUser])
  }
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userId = localStorage.getItem(CURRENT_USER_KEY)
  if (!userId) return null
  const users = getUsers()
  return users.find((u) => u.id === userId) || null
}

export function setCurrentUser(userId: string | null) {
  if (typeof window === "undefined") return
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId)
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

export function login(email: string, password: string): User | null {
  const users = getUsers()
  // Simple password check: password is "password" for all users, or "admin" for admin
  const user = users.find((u) => u.email === email)
  if (!user) return null

  const validPassword = user.role === "admin" ? password === "admin" : password === "password"
  if (!validPassword) return null

  setCurrentUser(user.id)
  return user
}

export function register(email: string, password: string, name: string): User | null {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    return null // Email already exists
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    balance: 0,
    role: "user",
    isNeccMember: false,
    createdAt: new Date().toISOString(),
  }

  saveUsers([...users, newUser])
  setCurrentUser(newUser.id)
  return newUser
}

export function logout() {
  setCurrentUser(null)
}

export function updateUserBalance(userId: string, newBalance: number) {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance
    saveUsers(users)
  }
}

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  const transactions = localStorage.getItem(TRANSACTIONS_KEY)
  return transactions ? JSON.parse(transactions) : []
}

export function addTransaction(transaction: Omit<Transaction, "id" | "timestamp">) {
  if (typeof window === "undefined") return
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([...transactions, newTransaction]))
}
