const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const db = process.env.DBS;
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('DB connected successfully');
  } catch (err) {
    console.error('DB connection error:', err.message || err);
    process.exit(1);
  }
};
//
module.exports = connectDB;
