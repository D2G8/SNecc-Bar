import { supabase } from '@/app/config/supabaseClient'

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

export interface Product {
  id: string
  name: string
  price: number
  stock: number
}

const TRANSACTIONS_KEY = "vending_transactions"
const PRODUCTS_KEY = "vending_products"

// Initialize products only
export function initializeAuth() {
  const products = getProducts()
  const defaultProducts: Product[] = [
    { id: "1", name: "Coffee", price: 1.50, stock: 10 },
    { id: "2", name: "Coke", price: 2.00, stock: 15 },
    { id: "3", name: "Coke Zero", price: 2.00, stock: 12 },
    { id: "4", name: "Water", price: 1.00, stock: 20 },
    { id: "5", name: "M&Ms", price: 1.80, stock: 8 },
    { id: "6", name: "Twix", price: 1.80, stock: 6 },
    { id: "7", name: "Maltesers", price: 1.80, stock: 9 },
    { id: "8", name: "Monster", price: 2.50, stock: 5 },
    { id: "9", name: "Napolitanas", price: 1.50, stock: 10 },
  ]

  if (products.length === 0) {
    saveProducts(defaultProducts)
  } else {
    // Ensure all default products are present, adding any missing ones
    const existingIds = products.map(p => p.id)
    const missingProducts = defaultProducts.filter(p => !existingIds.includes(p.id))
    if (missingProducts.length > 0) {
      saveProducts([...products, ...missingProducts])
    }
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    balance: data.balance,
    role: data.role,
    isNeccMember: data.is_necc_member,
    createdAt: data.created_at,
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Login error:', error)
    return null
  }

  return await getCurrentUser()
}

export async function register(email: string, password: string, name: string): Promise<User | null> {
  console.log('Attempting to register:', email)
  const { data, error } = await supabase.auth.signUp({ email, password })
  console.log('signup data', data, 'error', error)
  if (error) {
    console.error('Sign up error:', error)
    return null
  }

  if (!data.user) {
    console.error('data.user is null - signup didn’t complete')
    return null
  }

  console.log('data.user.id:', data.user.id)

  // Determine role based on email
  const role = email === 'admin@necc.com' ? 'admin' : 'user'
  const balance = role === 'admin' ? 1000 : 0

  console.log('Inserting user profile:', { id: data.user.id, email, name, balance, role })
  // Insert into users table
  const { data: rowData, error: insertError } = await supabase
    .from('users')
    .insert([{
      id: data.user.id,
      email,
      name,
      balance,
      role,
      is_necc_member: false,
    }])

  console.log('Insert result:', rowData, 'Insert error:', insertError)
  if (insertError) {
    console.error('Insert user error:', insertError)
    return null
  }

  console.log('Registration successful')
  return await getCurrentUser()
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Logout error:', error)
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*')
  if (error) {
    console.error('Get users error:', error)
    return []
  }
  return data.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    balance: user.balance,
    role: user.role,
    isNeccMember: user.is_necc_member,
    createdAt: user.created_at,
  }))
}

export async function updateUserBalance(userId: string, newBalance: number) {
  const { error } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId)

  if (error) console.error('Update balance error:', error)
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

export function getProducts(): Product[] {
  if (typeof window === "undefined") return []
  const products = localStorage.getItem(PRODUCTS_KEY)
  return products ? JSON.parse(products) : []
}

export function saveProducts(products: Product[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function updateProductStock(productId: string, newStock: number) {
  const products = getProducts()
  const productIndex = products.findIndex((p) => p.id === productId)
  if (productIndex !== -1) {
    products[productIndex].stock = newStock
    saveProducts(products)
  }
}
