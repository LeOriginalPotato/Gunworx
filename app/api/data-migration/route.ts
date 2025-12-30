import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Neon database queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "status":
        const firearmCount = await sql`SELECT COUNT(*) as count FROM firearms`
        const inspectionCount = await sql`SELECT COUNT(*) as count FROM inspections`
        const userCount = await sql`SELECT COUNT(*) as count FROM users`

        return NextResponse.json({
          status: "online",
          timestamp: new Date().toISOString(),
          counts: {
            firearms: firearmCount[0].count,
            inspections: inspectionCount[0].count,
            users: userCount[0].count,
          },
        })

      case "backup":
        const firearms = await sql`SELECT * FROM firearms`
        const inspections = await sql`SELECT * FROM inspections`
        const users = await sql`SELECT id, username, role, full_name, email, created_at, is_active FROM users`

        return NextResponse.json({
          timestamp: new Date().toISOString(),
          data: {
            firearms,
            inspections,
            users,
          },
        })

      default:
        const allFirearms = await sql`SELECT * FROM firearms`
        const allInspections = await sql`SELECT * FROM inspections`
        const allUsers = await sql`SELECT id, username, role, full_name, email, created_at, is_active FROM users`

        return NextResponse.json({
          firearms: allFirearms,
          inspections: allInspections,
          users: allUsers,
        })
    }
  } catch (error) {
    console.error("Error in data-migration GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "sync":
        // Merge incoming data with existing data
        if (data.firearms && data.firearms.length > 0) {
          for (const firearm of data.firearms) {
            const existing = await sql`
              SELECT id FROM firearms WHERE id = ${firearm.id}
            `

            if (existing.length > 0) {
              await sql`
                UPDATE firearms
                SET
                  stock_no = ${firearm.stockNo},
                  make = ${firearm.make},
                  status = ${firearm.status},
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ${firearm.id}
              `
            } else {
              await sql`
                INSERT INTO firearms (id, stock_no, date_received, make, type, caliber, serial_no, status)
                VALUES (${firearm.id}, ${firearm.stockNo}, ${firearm.dateReceived}, ${firearm.make}, ${firearm.type}, ${firearm.caliber}, ${firearm.serialNo}, ${firearm.status})
              `
            }
          }
        }

        if (data.inspections && data.inspections.length > 0) {
          for (const inspection of data.inspections) {
            const existing = await sql`
              SELECT id FROM inspections WHERE id = ${inspection.id}
            `

            if (existing.length > 0) {
              await sql`
                UPDATE inspections
                SET
                  status = ${inspection.status},
                  updated_at = CURRENT_TIMESTAMP
                WHERE id = ${inspection.id}
              `
            } else {
              await sql`
                INSERT INTO inspections (id, date, inspector, status)
                VALUES (${inspection.id}, ${inspection.date}, ${inspection.inspector}, ${inspection.status})
              `
            }
          }
        }

        const firearmCount = await sql`SELECT COUNT(*) as count FROM firearms`
        const inspectionCount = await sql`SELECT COUNT(*) as count FROM inspections`
        const userCount = await sql`SELECT COUNT(*) as count FROM users`

        return NextResponse.json({
          success: true,
          synced: {
            firearms: data.firearms?.length || 0,
            inspections: data.inspections?.length || 0,
            users: data.users?.length || 0,
          },
          data: {
            firearms: await sql`SELECT * FROM firearms`,
            inspections: await sql`SELECT * FROM inspections`,
            users: await sql`SELECT * FROM users`,
          },
        })

      case "restore":
        // Clear existing data
        await sql`DELETE FROM firearms`
        await sql`DELETE FROM inspections`
        await sql`DELETE FROM users`

        // Restore from backup
        if (data.firearms) {
          for (const firearm of data.firearms) {
            await sql`
              INSERT INTO firearms (id, stock_no, date_received, make, type, caliber, serial_no, status, created_at)
              VALUES (${firearm.id}, ${firearm.stockNo}, ${firearm.dateReceived}, ${firearm.make}, ${firearm.type}, ${firearm.caliber}, ${firearm.serialNo}, ${firearm.status}, ${firearm.createdAt})
            `
          }
        }

        return NextResponse.json({
          success: true,
          restored: {
            firearms: data.firearms?.length || 0,
            inspections: data.inspections?.length || 0,
            users: data.users?.length || 0,
          },
        })

      case "clear_inspections":
        await sql`DELETE FROM inspections`

        return NextResponse.json({
          success: true,
          cleared: true,
        })

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in data-migration POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
