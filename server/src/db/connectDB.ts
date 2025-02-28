import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI || ""}`);
    console.log(`Database is connected at PORT: ${process.env.PORT}`);
  } catch (error) {
    console.log(`Error: ${error}`);
    process.exit(1);
  }
}
