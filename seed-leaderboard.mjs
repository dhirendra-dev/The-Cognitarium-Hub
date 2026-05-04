import mysql from 'mysql2/promise';

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Rohan', 'Ishaan', 'Nikhil', 'Harsh', 'Siddharth', 'Karan',
  'Priya', 'Ananya', 'Diya', 'Pooja', 'Neha', 'Isha', 'Shreya', 'Sakshi', 'Divya', 'Anjali',
  'Rahul', 'Vikram', 'Akshay', 'Varun', 'Aryan', 'Dhruv', 'Pranav', 'Yash', 'Rishabh', 'Abhishek',
  'Meera', 'Nisha', 'Kavya', 'Riya', 'Sneha', 'Swati', 'Tanvi', 'Aadhya', 'Bhavna', 'Chitra',
  'Sameer', 'Tarun', 'Umesh', 'Vimal', 'Waqar', 'Xander', 'Yatin', 'Zain', 'Arpit', 'Bhuvan'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Rao', 'Nair', 'Reddy', 'Iyer',
  'Bhat', 'Desai', 'Joshi', 'Kulkarni', 'Mishra', 'Pandey', 'Saxena', 'Trivedi', 'Upadhyay', 'Varma'
];

const cities = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 
  'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Surat', 'Nagpur', 'Bhopal'
];

async function seedLeaderboard() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
    user: process.env.DATABASE_URL?.split('//')[1]?.split(':')[0] || 'root',
    password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
    database: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'hslc_prep',
  });

  try {
    console.log('🌱 Starting leaderboard seeding...');

    // Get existing users count
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = existingUsers[0].count;
    console.log(`📊 Found ${userCount} existing users`);

    // Generate 50 users with realistic data
    const users = [];
    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@hslcprep.com`;
      
      users.push({
        name,
        email,
        role: 'user',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date in last 90 days
      });
    }

    // Insert users
    console.log('👥 Inserting 50 new users...');
    const userIds = [];
    for (const user of users) {
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, role, createdAt) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.role, user.createdAt]
      );
      userIds.push(result.insertId);
    }

    // Generate leaderboard entries
    console.log('🏆 Creating leaderboard entries...');
    const leaderboardEntries = [];
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const topicsCompleted = Math.floor(Math.random() * 150) + 20; // 20-170 topics
      const totalHoursStudied = Math.floor(Math.random() * 500) + 50; // 50-550 hours
      const currentStreak = Math.floor(Math.random() * 60) + 1; // 1-60 day streak
      
      // Calculate points: 10 per topic + 1 per hour + streak bonus
      const points = (topicsCompleted * 10) + totalHoursStudied + (currentStreak * 5);
      
      leaderboardEntries.push({
        userId,
        topicsCompleted,
        totalHoursStudied,
        currentStreak,
        points,
        lastUpdated: new Date()
      });
    }

    // Sort by points descending to ensure realistic ranking
    leaderboardEntries.sort((a, b) => b.points - a.points);

    // Insert leaderboard entries
    for (const entry of leaderboardEntries) {
      await connection.execute(
        'INSERT INTO leaderboard (userId, topicsCompleted, totalHoursStudied, currentStreak, points, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)',
        [entry.userId, entry.topicsCompleted, entry.totalHoursStudied, entry.currentStreak, entry.points, entry.lastUpdated]
      );
    }

    console.log('✅ Leaderboard seeding completed successfully!');
    console.log(`📈 Top 5 performers:`);
    
    // Display top 5
    const [topUsers] = await connection.execute(`
      SELECT u.name, l.points, l.topicsCompleted, l.totalHoursStudied, l.currentStreak
      FROM leaderboard l
      JOIN users u ON l.userId = u.id
      ORDER BY l.points DESC
      LIMIT 5
    `);

    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} - ${user.points} points (${user.topicsCompleted} topics, ${user.totalHoursStudied}h, ${user.currentStreak} day streak)`);
    });

  } catch (error) {
    console.error('❌ Error seeding leaderboard:', error);
  } finally {
    await connection.end();
  }
}

seedLeaderboard();
