import pkg from 'pg'
const { Client } = pkg

const client = new Client({
  connectionString: 'postgresql://postgres:Adfj.252728.@db.pzhlayhkmqsfewgwynir.supabase.co:6543/postgres',
  ssl: { rejectUnauthorized: false }
})

export const connectDB = async () => {
  await client.connect()
}

export const query = async (text: string, params?: any[]) => {
  const res = await client.query(text, params)
  return res.rows
}

export const disconnectDB = async () => {
  await client.end()
}
