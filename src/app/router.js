import express from "express";
import authRouter from "../modules/auth/auth.router.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.json("Technogenix server is runing");
});

// user router
router.use("/api/v1/auth", authRouter);

export default router;
