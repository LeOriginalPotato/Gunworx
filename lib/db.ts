import { neon } from "@neondatabase/serverless"

// Create reusable SQL client
const sql = neon(process.env.DATABASE_URL!)

export { sql }
