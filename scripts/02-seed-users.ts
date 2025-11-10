import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function seedUsers() {
  try {
    console.log("Seeding users...")

    const users = [
      {
        id: "1",
        username: "admin",
        password: "admin123",
        role: "admin",
        fullName: "System Administrator",
        email: "admin@gunworx.com",
        isActive: true,
      },
      {
        id: "2",
        username: "inspector",
        password: "inspect123",
        role: "inspector",
        fullName: "Wikus Fourie",
        email: "wikus@gunworx.com",
        isActive: true,
      },
      {
        id: "3",
        username: "user",
        password: "user123",
        role: "user",
        fullName: "Regular User",
        email: "user@gunworx.com",
        isActive: true,
      },
    ]

    for (const user of users) {
      await sql`
        INSERT INTO users (id, username, password, role, full_name, email, is_active)
        VALUES (${user.id}, ${user.username}, ${user.password}, ${user.role}, ${user.fullName}, ${user.email}, ${user.isActive})
        ON CONFLICT (id) DO NOTHING;
      `
      console.log(`Created user: ${user.username}`)
    }

    console.log("Users seeded successfully!")
  } catch (error) {
    console.error("Error seeding users:", error)
    throw error
  }
}

seedUsers()
