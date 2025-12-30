import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSQL() {
  if (!_sql) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error(
        "Database connection string not found. Please set NEON_DATABASE_URL or DATABASE_URL environment variable.",
      )
    }
    _sql = neon(connectionString)
  }
  return _sql
}

// Export the sql function that supports tagged templates
export const sql = getSQL()
