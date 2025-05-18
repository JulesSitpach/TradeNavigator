// server/routes/auth.ts
import express from "express";
import * as authController from "../controllers/authController";

const router = express.Router();

// Authentication routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);

export default router;