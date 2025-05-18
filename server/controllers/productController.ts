// server/controllers/productController.ts
import { insertProductSchema } from "@shared/schema";
import * as productService from "../services/productService";
import { createPaginationResult } from "../middleware/pagination";
import type { Request, Response, NextFunction } from "express";
import { NotFoundError, ForbiddenError } from "../utils/errors";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use pagination if available
    if (req.pagination) {
      const { offset, limit } = req.pagination;
      
      const products = await productService.getProductsByUserPaginated(
        req.session.userId,
        offset,
        limit
      );
      
      const totalCount = await productService.countProductsByUser(req.session.userId);
      
      return res.json(createPaginationResult(products, totalCount, req.pagination));
    }
    
    // Otherwise get all products
    const products = await productService.getProductsByUser(req.session.userId);
    
    // For development, this is a fallback for empty results
    if (process.env.NODE_ENV === 'development' && (!products || products.length === 0)) {
      // Return sample products for development
      return res.json([
        {
          id: 1,
          userId: 1,
          name: 'Organic Cotton T-Shirts',
          description: 'Eco-friendly cotton apparel for sustainable fashion',
          hsCode: '6109.10',
          value: 1200,
          weight: 120,
          dimensions: '30x20x15',
          countryOfOrigin: 'IN',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        // other sample products
      ]);
    }
    
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await productService.getProduct(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    
    // Check if the product belongs to the user
    if (product.userId !== req.session.userId) {
      throw new ForbiddenError("Access denied");
    }
    
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productInput = insertProductSchema.safeParse({
      ...req.body,
      userId: req.session.userId
    });
    
    if (!productInput.success) {
      return res.status(400).json({ message: "Invalid product data", errors: productInput.error.errors });
    }
    
    const product = await productService.createProduct(productInput.data);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await productService.getProduct(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    
    // Check if the product belongs to the user
    if (product.userId !== req.session.userId) {
      throw new ForbiddenError("Access denied");
    }
    
    const updatedProduct = await productService.updateProduct(productId, {
      ...req.body,
      userId: req.session.userId // Ensure userId doesn't change
    });
    
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await productService.getProduct(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    
    // Check if the product belongs to the user
    if (product.userId !== req.session.userId) {
      throw new ForbiddenError("Access denied");
    }
    
    const deleted = await productService.deleteProduct(productId, req.session.userId);
    if (!deleted) {
      return res.status(500).json({ message: "Failed to delete product" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};
