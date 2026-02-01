import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function registerAdmin() {
  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Create a unique openId for the admin user
    const openId = `admin-dhirendra-${Date.now()}`;

    // Insert the admin user
    await db.insert(users).values({
      openId,
      name: "Dhirendra Kumar",
      email: "dk2649367@gmail.com",
      loginMethod: "manual",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    console.log("✅ Admin user registered successfully!");
    console.log(`OpenID: ${openId}`);
    console.log("Email: dk2649367@gmail.com");
    console.log("Role: admin");
    console.log("\nNote: The password 'dhirendraofficial' needs to be set up through the OAuth login system.");
    console.log("Please use the Manus OAuth login to authenticate.");

    await connection.end();
  } catch (error) {
    console.error("❌ Error registering admin:", error);
    process.exit(1);
  }
}

registerAdmin();
