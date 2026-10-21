const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

if (process.env.DNS_SERVERS) {
  require("dns").setServers(
    process.env.DNS_SERVERS.split(",").map((server) => server.trim())
  );
}

// Imports the sample accounts from database/users.json (MongoDB Extended
// JSON export) into the configured database. Passwords in that file are
// already bcrypt hashes, so they are copied as-is; plaintext is never used.
// Existing users (same email or _id) are skipped, never modified.
//
// Usage: npm run seed-users [-- --dry-run] [-- path/to/users.json]
const dryRun = process.argv.includes("--dry-run");
const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
const usersFile = path.resolve(
  fileArg || path.join(__dirname, "../../database/users.json")
);

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$.{53}$/;

const seedUsers = async () => {
  const { EJSON } = mongoose.mongo.BSON;
  const sampleUsers = EJSON.parse(fs.readFileSync(usersFile, "utf8"));

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(
      `Connected to database "${mongoose.connection.db.databaseName}"${dryRun ? " (dry run)" : ""}`
    );

    let created = 0;

    for (const sample of sampleUsers) {
      const email = String(sample.email || "").toLowerCase().trim();

      if (!email || !BCRYPT_HASH.test(sample.password || "")) {
        console.log(`Skipped ${email || "(no email)"}: password is not a bcrypt hash.`);
        continue;
      }

      const existing = await User.findOne({
        $or: [{ email }, { _id: sample._id }],
      });

      if (existing) {
        console.log(`Skipped ${email}: account already exists.`);
        continue;
      }

      if (!dryRun) {
        await User.collection.insertOne({
          _id: sample._id,
          name: sample.name,
          email,
          password: sample.password,
          role: sample.role,
          resetOtpHash: null,
          resetOtpExpires: null,
          resetOtpVerified: false,
          createdAt: sample.createdAt || new Date(),
          updatedAt: sample.updatedAt || new Date(),
          __v: 0,
        });
      }

      created++;
      console.log(`${dryRun ? "Would create" : "Created"} ${email} (${sample.role})`);
    }

    console.log(`${dryRun ? "Would create" : "Created"} ${created} account(s).`);
  } catch (error) {
    console.error("Seed Users Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedUsers();
