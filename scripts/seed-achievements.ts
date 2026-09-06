import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { achievements } from "../lib/db/schema/achievements";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const defaultAchievements = [
  { code: "first_100_days", title: "100 Hari Bersama", description: "Genap 100 hari sejak hubungan kalian dimulai.", icon: "💯", triggerType: "days_together", triggerValue: { days: 100 } },
  { code: "first_year", title: "Satu Tahun", description: "Anniversary pertama kalian.", icon: "🌹", triggerType: "days_together", triggerValue: { days: 365 } },
  { code: "first_500_days", title: "500 Hari", description: "Tepat 500 hari kalian bersama.", icon: "⭐", triggerType: "days_together", triggerValue: { days: 500 } },
  { code: "first_1000_days", title: "1000 Hari", description: "Lebih dari 2.5 tahun penuh kenangan.", icon: "🏆", triggerType: "days_together", triggerValue: { days: 1000 } },
  { code: "memory_10", title: "10 Memori Tersimpan", description: "Kalian sudah menyimpan 10 kenangan.", icon: "📸", triggerType: "memory_count", triggerValue: { count: 10 } },
  { code: "memory_50", title: "50 Memori Tersimpan", description: "Kalian sudah menyimpan 50 kenangan.", icon: "🎞️", triggerType: "memory_count", triggerValue: { count: 50 } },
  { code: "first_bucket_done", title: "Bucket List Pertama Selesai", description: "Item bucket list pertama kalian tercapai.", icon: "✅", triggerType: "bucket_completed", triggerValue: { count: 1 } },
  { code: "bucket_5_done", title: "5 Impian Terwujud", description: "5 item bucket list sudah tercapai.", icon: "🎯", triggerType: "bucket_completed", triggerValue: { count: 5 } },
  { code: "first_trip", title: "Trip Pertama", description: "Kenangan perjalanan pertama bersama.", icon: "✈️", triggerType: "trip_count", triggerValue: { count: 1 } },
  { code: "trip_5", title: "5 Trip Bersama", description: "Petualangan ke-5 sudah tercatat.", icon: "🗺️", triggerType: "trip_count", triggerValue: { count: 5 } },
];

async function main() {
  console.log("Seeding achievements...");
  for (const ach of defaultAchievements) {
    await db.insert(achievements).values(ach).onConflictDoNothing({ target: achievements.code });
  }
  console.log("Done.");
  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});