import { users } from '../drizzle/schema';
import { sdk } from '../server/_core/sdk';
import { getDb, getUserByEmail } from '../server/db';

const adminEmail = 'dk2649367@gmail.com';
const adminName = 'Dhirendra Kumar';
const tempPassword = 'Admin@123456';

async function createAdmin() {
  try {
    console.log('Checking if admin user exists...');
    
    const existingUser = await getUserByEmail(adminEmail);
    if (existingUser) {
      console.log('✅ Admin user already exists');
      console.log('Email:', adminEmail);
      process.exit(0);
    }

    console.log('Creating admin user...');
    const hashedPassword = sdk.hashPassword(tempPassword);
    const db = await getDb();
    if (!db) {
      throw new Error('Failed to connect to database');
    }

    const result = await db.insert(users).values({
      openId: `admin-${Date.now()}`,
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      loginMethod: 'email',
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Temporary Password:', tempPassword);
    console.log('\nPlease log in at /login and change your password.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
