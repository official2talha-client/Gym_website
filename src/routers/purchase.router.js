import { Router } from "express";

import {
  createPurchase,
  getPurchaseById,
  getAllPurchases,
  deletePurchase,
  changePurchaseStatus,
  getUserPurchases
,getMyPurchases,
} from "../controller/purchase.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
import {  validate} from "../middlwares/validate.middleware.js";
import { acceptPurchaseSchema } from "../validators/purchase.validator.js";

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
  getAllPurchases
);

// Get purchases of a specific user
router.get(
  "/user/:userId",
  verifyJWT,
  getUserPurchases
);

// Get purchase by ID
router.get(
  "/:id",
  verifyJWT,
  getPurchaseById
);

// Reject purchase
router.patch(
  "/:id/status",
  verifyJWT,
  validate(acceptPurchaseSchema),
  changePurchaseStatus
);

// Delete purchase
router.delete(
  "/:id",
  verifyJWT,
  deletePurchase
);


export default router;