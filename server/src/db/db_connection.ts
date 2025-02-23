import mongoose from "mongoose";
import { DB_Name } from "../lib/constants";

export default async function connentDB() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI || ""}/${DB_Name}`);
    console.log(`Database is connected at PORT: ${process.env.PORT}`);
  } catch (error) {
    console.log(`Error: ${error}`);
    process.exit(1);
  }
}
