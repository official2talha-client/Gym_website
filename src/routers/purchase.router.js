import { Router } from "express";

import {
  createPurchase,
  getPurchaseById,
  getAllPurchases,
  deletePurchase,
  changePurchaseStatus,
  getUserPurchases,
  getMyPurchases,
} from "../controller/purchase.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
import { validate } from "../middlwares/validate.middleware.js";
import { rejectPurchaseSchema } from "../validators/purchase.validator.js";
import { verifyAdmin } from "../middlwares/admin.middleware.js";

const router = Router();

// ======================================================
// USER
// ======================================================

// Create membership/purchase request
router.post(
  "/",
  verifyJWT,
  createPurchase
);

// Get logged-in user's purchases
router.get(
  "/my",
  verifyJWT,
  getMyPurchases
);

// ======================================================
// ADMIN
// ======================================================

// Get all purchases
router.get(
  "/",
  verifyJWT,
  verifyAdmin,
  getAllPurchases
);

// Get purchases of a specific user
router.get(
  "/user/:userId",
  verifyJWT,
  verifyAdmin,
  getUserPurchases
);

// Reject purchase
router.patch(
  "/:id/status",
  verifyJWT,
  verifyAdmin,
  validate(rejectPurchaseSchema),
  changePurchaseStatus
);

// ======================================================
// USER / GENERAL
// ======================================================

// Get purchase by ID
router.get(
  "/:id",
  verifyJWT,
  getPurchaseById
);

// Delete purchase
router.delete(
  "/:id",
  verifyJWT,
  deletePurchase
);

export default router;