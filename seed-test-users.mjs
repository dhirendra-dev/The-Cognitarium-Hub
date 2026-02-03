import mysql from 'mysql2/promise';

const testUsers = [
  { name: "Rajesh Kumar", email: "rajesh@example.com", openId: "user_rajesh_001" },
  { name: "Priya Singh", email: "priya@example.com", openId: "user_priya_001" },
  { name: "Amit Patel", email: "amit@example.com", openId: "user_amit_001" },
  { name: "Neha Sharma", email: "neha@example.com", openId: "user_neha_001" },
  { name: "Vikram Desai", email: "vikram@example.com", openId: "user_vikram_001" },
  { name: "Anjali Gupta", email: "anjali@example.com", openId: "user_anjali_001" },
  { name: "Rohan Verma", email: "rohan@example.com", openId: "user_rohan_001" },
  { name: "Divya Nair", email: "divya@example.com", openId: "user_divya_001" },
];

async function seedDatabase() {
  let connection;
  try {
    const dbUrl = process.env.DATABASE_URL || 'mysql://root@localhost/hslc_prep';
    const url = new URL(dbUrl);
    
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username || 'root',
      password: url.password || '',
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
    
    console.log("🌱 Starting to seed test users...\n");
    
    for (const user of testUsers) {
      try {
        const [userResult] = await connection.query(
          'INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
          [user.openId, user.name, user.email, 'test', 'user']
        );
        
        const userId = userResult.insertId;
        console.log(`✅ Created user: ${user.name} (ID: ${userId})`);
        
        const hoursStudied = Math.floor(Math.random() * 80) + 10;
        const topicsCompleted = Math.floor(Math.random() * 45) + 5;
        const chaptersCompleted = Math.floor(Math.random() * 12) + 1;
        const samplePapersCompleted = Math.floor(Math.random() * 8) + 1;
        const averageScore = (Math.random() * 40 + 60).toFixed(1);
        const streakDays = Math.floor(Math.random() * 25) + 1;
        const points = (topicsCompleted * 10) + (chaptersCompleted * 20) + (samplePapersCompleted * 15) + Math.floor(averageScore);
        
        await connection.query(
          'INSERT INTO leaderboard (userId, totalHoursStudied, topicsCompleted, chaptersCompleted, samplePapersCompleted, averageScore, streakDays, points, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
          [userId, hoursStudied.toString(), topicsCompleted, chaptersCompleted, samplePapersCompleted, averageScore, streakDays, points]
        );
        
        console.log(`   📊 Study Data: ${hoursStudied}h, ${topicsCompleted} topics, ${chaptersCompleted} chapters, ${samplePapersCompleted} papers, Score: ${averageScore}%, Streak: ${streakDays}d, Points: ${points}\n`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⏭️  User ${user.name} already exists, skipping...\n`);
        } else {
          throw error;
        }
      }
    }
    
    console.log("✨ Successfully seeded all test users!\n");
    console.log("📈 Leaderboard is now populated with sample data.");
    console.log("🎯 You can now view the leaderboard on the website.\n");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
