/**
 * Loads the Project 4 demo data into MongoDB using Mongoose.
 * Run: node loadDatabase.js
 *
 * Uses MONGODB_URI when provided, else falls back to local project4 DB.
 * Collections affected: User, Photo, SchemaInfo. Existing data is cleared.
 *
 * Each seeded user gets login_name = lowercase last_name and password_digest set to the
 * bcrypt hash below (for bcrypt-based login with plaintext input "weak").
 */

// We use the Mongoose to define the schema stored in MongoDB.
import mongoose from "mongoose";
import bluebird from "bluebird";
import models from "./modelData/photoApp.js";

// Load the Mongoose schema for Use and Photo
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";
import dotenv from 'dotenv';
dotenv.config();




/** Bcrypt digest for seeded accounts; bcrypt.compare("weak", ...) is true. */
const SEEDED_PASSWORD_DIGEST =
  "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

const cloudinaryUrls = {
  "kenobi1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568710/photoapp-seed/kenobi1.jpg",
  "kenobi2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi2.jpg",
  "kenobi3.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi3.jpg",
  "kenobi4.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/kenobi4.jpg",
  "ludgate1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/ludgate1.jpg",
  "malcolm1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm1.jpg",
  "malcolm2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm2.jpg",
  "ouster.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ouster.jpg",
  "ripley1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ripley1.jpg",
  "ripley2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/ripley2.jpg",
  "took1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/took1.jpg",
  "took2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568716/photoapp-seed/took2.jpg",
};


mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
console.log("MONGO URI:", process.env.MONGODB_URI);
const mongoUri =
  process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1/project4";

async function main() {
  await mongoose.connect(mongoUri);

  console.log("Connected DB:", mongoose.connection.name);

  // remove this line (it crashes before ready)
  // console.log("DB NAME:", mongoose.connection.db.databaseName);

  await Promise.all([
    User.deleteMany({}),
    Photo.deleteMany({}),
    SchemaInfo.deleteMany({}),
  ]);

  const userModels = models.userListModel();
  const mapFakeId2RealId = {};

  const userPromises = userModels.map(async (user) => {
  const userObj = await User.create({
    first_name: user.first_name,
    last_name: user.last_name,
    location: user.location,
    description: user.description,
    occupation: user.occupation,
    login_name: user.last_name.toLowerCase(),
    password_digest: SEEDED_PASSWORD_DIGEST,
  });

  mapFakeId2RealId[user._id] = userObj._id;

  console.log(
    "Adding user:",
    user.first_name + " " + user.last_name,
    "with ID",
    userObj._id
  );
});

  await Promise.all(userPromises);

  const photoModels = [];
  Object.keys(mapFakeId2RealId).forEach((id) => {
    photoModels.push(...models.photoOfUserModel(id));
  });

  const photoPromises = photoModels.map(async (photo) => {
  const seededPhotoUrl = cloudinaryUrls[photo.file_name];

  const photoObj = await Photo.create({
    file_name: seededPhotoUrl,
    date_time: photo.date_time,
    user_id: mapFakeId2RealId[photo.user_id],
  });

  if (photo.comments) {
    for (const comment of photo.comments) {
      photoObj.comments.push({
        comment: comment.comment,
        date_time: comment.date_time,
        user_id: mapFakeId2RealId[comment.user._id],
      });
    }

    await photoObj.save();
  }

  console.log("Adding photo:", photo.file_name);
});

  await Promise.all(photoPromises);

  await SchemaInfo.create(models.schemaInfo2());
  console.log("SchemaInfo object created");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
});