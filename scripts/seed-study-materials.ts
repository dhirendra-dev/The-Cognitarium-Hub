import { getDb } from "../server/db";
import { InsertStudyMaterial, studyMaterials as studyMaterialsTable } from "../drizzle/schema";
import { drizzle } from "drizzle-orm/mysql2";

const studyMaterials: InsertStudyMaterial[] = [
  // PW Modules
  {
    title: "PW Arjuna Module Latest",
    category: "PW Modules",
    subcategory: "Complete Collection",
    description: "Latest PW Arjuna modules with comprehensive coverage of all JEE topics",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1MhZZ4V9G39SbwW871rQf6KFgnX4KcTO-",
    author: "Physics Wallah",
    subject: "Physics",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },
  {
    title: "PW Handbook",
    category: "PW Modules",
    subcategory: "Reference Material",
    description: "Complete PW handbook for quick revision and concept clarity",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1ElYT7NBR2dp5MJALmQlO3cdqlPmX_dcW",
    author: "Physics Wallah",
    difficulty: "beginner",
    isPopular: true,
    order: 2,
  },
  {
    title: "PW Module 2025",
    category: "PW Modules",
    subcategory: "Latest Edition",
    description: "Updated 2025 modules with latest exam patterns",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1ns3Z5v3h1ilzBQVrQt-ZZT3p-PuY0s2M",
    author: "Physics Wallah",
    difficulty: "intermediate",
    isPopular: true,
    order: 3,
  },

  // Cengage Series
  {
    title: "Cengage Physics",
    category: "Cengage Series",
    subcategory: "Physics",
    description: "Complete Cengage physics series with solved examples and practice problems",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1BU5c0hxkMl9CiOw4pizrbqle43Hb4PZj",
    author: "Cengage",
    subject: "Physics",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },
  {
    title: "Cengage Chemistry",
    category: "Cengage Series",
    subcategory: "Chemistry",
    description: "Comprehensive chemistry coverage with organic, inorganic, and physical chemistry",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1nqCKOBcc-R1EEGSVP0KIsYdI-1ndnwfI",
    author: "Cengage",
    subject: "Chemistry",
    difficulty: "intermediate",
    isPopular: true,
    order: 2,
  },
  {
    title: "Cengage Mathematics",
    category: "Cengage Series",
    subcategory: "Mathematics",
    description: "Complete mathematics series covering all topics for JEE",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1lJ3rOAQ2HkcsxZyspbg371f2Wep4aSFt",
    author: "Cengage",
    subject: "Mathematics",
    difficulty: "intermediate",
    isPopular: true,
    order: 3,
  },

  // Coaching Materials
  {
    title: "Allen Material",
    category: "Coaching Materials",
    subcategory: "Allen Kota",
    description: "Complete Allen coaching material for JEE Main and Advanced",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1GO-X-fMuEH6grA86t7_jxUUfqC8NZL60",
    author: "Allen",
    difficulty: "advanced",
    isPopular: true,
    order: 1,
  },
  {
    title: "Allen Modules",
    category: "Coaching Materials",
    subcategory: "Allen Kota",
    description: "Allen's comprehensive module collection for systematic learning",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1SynXg8rH1-RKSSElHvKDlNCorX27CyB1",
    author: "Allen",
    difficulty: "intermediate",
    isPopular: true,
    order: 2,
  },
  {
    title: "FIITJEE Material",
    category: "Coaching Materials",
    subcategory: "FIITJEE",
    description: "FIITJEE's premium study material for top-rank aspirants",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1HfdUddS90rthbmvC0dJXYuZTOH8ZioO2",
    author: "FIITJEE",
    difficulty: "advanced",
    isPopular: true,
    order: 3,
  },
  {
    title: "Narayana Modules",
    category: "Coaching Materials",
    subcategory: "Narayana",
    description: "Narayana's structured modules for comprehensive preparation",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1HX4srMDwIsyx4fOrdhzpwtaRmO5IFPn9",
    author: "Narayana",
    difficulty: "intermediate",
    order: 4,
  },
  {
    title: "Vibrant Modules",
    category: "Coaching Materials",
    subcategory: "Vibrant",
    description: "Vibrant's comprehensive study modules for JEE preparation",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1uwoBBDwrtdVVBgSvqLVkTdU6Q1uuorQU",
    author: "Vibrant",
    difficulty: "intermediate",
    order: 5,
  },

  // Physics Resources
  {
    title: "DC Pandey Physics",
    category: "Physics Resources",
    subcategory: "Physics Books",
    description: "DC Pandey's comprehensive physics book for JEE preparation",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1yK-e7N86xzFWaZHkuHXwQvBqRE985dQk",
    author: "DC Pandey",
    subject: "Physics",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },
  {
    title: "HC Verma Physics",
    category: "Physics Resources",
    subcategory: "Physics Books",
    description: "HC Verma's classic physics book with solved examples",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1oj32-UtrZ7d9fbqLKfQiMUIcR78MLMJG",
    author: "HC Verma",
    subject: "Physics",
    difficulty: "beginner",
    isPopular: true,
    order: 2,
  },
  {
    title: "Irodov Problems",
    category: "Physics Resources",
    subcategory: "Advanced Problems",
    description: "IE Irodov's advanced physics problems for competitive exams",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/13dIBfy8JfFQbsSdDwrrNUgC-M3N_Dnmx",
    author: "IE Irodov",
    subject: "Physics",
    difficulty: "advanced",
    isPopular: true,
    order: 3,
  },
  {
    title: "Physics Galaxy",
    category: "Physics Resources",
    subcategory: "Online Resources",
    description: "Physics Galaxy's comprehensive video and problem collection",
    resourceType: "website",
    url: "https://drive.google.com/drive/folders/1vj6tajLK4Ukdht5oup9Jl2O14oy2_SQT",
    author: "Physics Galaxy",
    subject: "Physics",
    difficulty: "intermediate",
    order: 4,
  },
  {
    title: "SL Arora Physics",
    category: "Physics Resources",
    subcategory: "Physics Books",
    description: "SL Arora's physics book for class 11 and 12",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/15tk3gPyr1Yqb_T_uIxjC77Ze5nT-j9tB",
    author: "SL Arora",
    subject: "Physics",
    difficulty: "beginner",
    order: 5,
  },

  // Chemistry Resources
  {
    title: "MS Chauhan Chemistry",
    category: "Chemistry Resources",
    subcategory: "Organic Chemistry",
    description: "MS Chauhan's comprehensive organic chemistry book",
    resourceType: "googleDrive",
    url: "https://drive.google.com/file/d/1zMvYB0nvvK3KAy3CqipYi0c9YSh4Ps3o/view",
    author: "MS Chauhan",
    subject: "Chemistry",
    difficulty: "advanced",
    isPopular: true,
    order: 1,
  },
  {
    title: "Narendra Avasthi Chemistry",
    category: "Chemistry Resources",
    subcategory: "Physical Chemistry",
    description: "Narendra Avasthi's physical chemistry book for JEE",
    resourceType: "googleDrive",
    url: "https://drive.google.com/file/d/1wScSVR0W_GI7d30Qw63wlq1k_aMznP8P/view",
    author: "Narendra Avasthi",
    subject: "Chemistry",
    difficulty: "advanced",
    isPopular: true,
    order: 2,
  },

  // Mathematics Resources
  {
    title: "Black Book Mathematics",
    category: "Mathematics Resources",
    subcategory: "Advanced Problems",
    description: "Black Book with advanced mathematics problems for JEE Advanced",
    resourceType: "googleDrive",
    url: "https://drive.google.com/file/d/1F9OPdur-22A828M1CBxgsR7Bj8WbMFko/view",
    author: "Unknown",
    subject: "Mathematics",
    difficulty: "advanced",
    isPopular: true,
    order: 1,
  },

  // Previous Year Questions
  {
    title: "JEE Previous Year Questions",
    category: "Previous Year Questions",
    subcategory: "PYQs",
    description: "Complete collection of JEE Main and Advanced previous year questions",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1MfMOx99dH2F_KQVAPVycGP9-o8bzPAH8",
    author: "Various",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },

  // Telegram Resources
  {
    title: "IIT JEE PDF by Dhirendra",
    category: "Community Resources",
    subcategory: "Telegram Channel",
    description: "Get all important books PDF for JEE before anyone else",
    resourceType: "telegram",
    url: "https://t.me/+BAba3f6zv8NjM2Zl",
    author: "Dhirendra Kumar",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },

  // Main Study Material
  {
    title: "IIT JEE Complete PDFs",
    category: "Complete Collections",
    subcategory: "Main Folder",
    description: "Complete collection of IIT JEE study material and resources",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/10W7sx0VYNkWFBbSnEOS8hwMBZcjg8dyS",
    author: "Various",
    difficulty: "intermediate",
    isPopular: true,
    order: 1,
  },
  {
    title: "All JEE Materials - Part 2",
    category: "Complete Collections",
    subcategory: "Main Folder",
    description: "Part 2 of complete JEE study material collection",
    resourceType: "googleDrive",
    url: "https://drive.google.com/drive/folders/1aQW30Y-uIUZq65XcSprJSIxi98_ZrP0x",
    author: "Various",
    difficulty: "intermediate",
    isPopular: true,
    order: 2,
  },
];

async function seedStudyMaterials() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  try {
    console.log("Seeding study materials...");
    for (const material of studyMaterials) {
      try {
        await db.insert(studyMaterialsTable).values(material);
      } catch (err: any) {
        // Ignore duplicate entries
        if (!err.message.includes("Duplicate")) {
          throw err;
        }
      }
    }
    console.log(`✓ Successfully seeded study materials`);
  } catch (error) {
    console.error("Error seeding study materials:", error);
    process.exit(1);
  }
}

seedStudyMaterials();
