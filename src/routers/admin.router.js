import { Router } from "express";

import {
  getAllUsers,
  getAllPurchases,
  updatePurchaseStatus,
  getPurchaseStatistics,
} from "../controller/admin.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
// import { verifyAdmin } from "../middlewares/admin.middleware.js";

import { validate } from "../middlwares/validate.middleware.js";

import {
  acceptPurchaseSchema
} from "../validators/purchase.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/users", getAllUsers);

router.get("/purchases", getAllPurchases);

router.patch(
  "/purchases/:id",
  validate(acceptPurchaseSchema),
  updatePurchaseStatus
);

router.get(
  "/statistics",
  getPurchaseStatistics
);

export default router;