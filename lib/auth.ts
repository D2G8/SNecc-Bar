import { supabase } from './supabase'

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

// Initialize with default admin user (run once, or seed manually)
export async function initializeAuth() {
  // Check if admin user exists
  const { data: adminUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@necc.com')
    .single()

  if (!adminUser) {
    // Note: You'll need to create the admin user via Supabase Auth first
    // Then insert into users table with role 'admin'
    console.log('Admin user not found. Please create admin@necc.com via Supabase Auth and seed the users table.')
  }
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data || []
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching current user:', error)
    return null
  }

  return data
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    return null
  }

  if (data.user) {
    const user = await getCurrentUser()
    return user
  }

  return null
}

export async function register(email: string, password: string, name: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error('Registration error:', error.message)
    return null
  }

  if (data.user) {
    // Insert user profile into users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        balance: 0,
        role: 'user',
        is_necc_member: false,
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return null
    }

    const user = await getCurrentUser()
    return user
  }

  return null
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error)
  }
}

export async function updateUserBalance(userId: string, newBalance: number) {
  const { error } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId)

  if (error) {
    console.error('Error updating balance:', error)
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('transactions')
    .select('*')
    .order('timestamp', { ascending: false })

  // If not admin, only fetch user's own transactions
  if (userData?.role !== 'admin') {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "timestamp">) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      items: transaction.items,
      total: transaction.total,
      is_for_someone_else: transaction.isForSomeoneElse,
      is_necc_member: transaction.isNeccMember,
    })

  if (error) {
    console.error('Error adding transaction:', error)
  }
}
