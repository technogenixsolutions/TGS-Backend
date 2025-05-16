import mongoose from "mongoose";

export default function db(dbString) {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(dbString, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.warn("Database connected successfully");
        resolve();
      })
      .catch((error) => {
        console.error("Error connecting to the database:", error);
        reject(error);
      });
  });
}
