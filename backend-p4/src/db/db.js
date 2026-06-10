import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
