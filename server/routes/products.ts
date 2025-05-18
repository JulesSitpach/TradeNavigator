// server/routes/products.ts
import express from "express";
import * as productController from "../controllers/productController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Product routes
router.get("/", isAuthenticated, productController.getProducts);
router.get("/:id", isAuthenticated, productController.getProduct);
router.post("/", isAuthenticated, productController.createProduct);
router.put("/:id", isAuthenticated, productController.updateProduct);
router.delete("/:id", isAuthenticated, productController.deleteProduct);

export default router;