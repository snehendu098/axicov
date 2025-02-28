import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
import connectDB from "./db/connectDB.js";

connectDB()
  .then((res) => {
    app.on("error", (err) => console.log("Error in app loading: ", err));

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log("MONGO connection failed !!!", err));
