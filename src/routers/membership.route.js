import express from "express";

import {
 createMembership,
 deleteMembership,
 getAllMemberships,
 getMembershipById,
 getMyMembership,
 getUserMemberships,
 updateMembership,
 createManualMembership,
 getMyExpiringMemberships
} from "../controller/membership.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
import {verifyAdmin}  from "../middlwares/admin.middleware.js";
import {createMembershipFromPurchaseSchema,updateMembershipSchema,offlineMembershipSchema,} from '../validators/membership.validator.js'
import { validate } from "../middlwares/validate.middleware.js";


const router = express.Router();

router.get(
  "/my",
  verifyJWT,
  getMyMembership
);

router.get(
  "/my/expiring",
  verifyJWT,
  getMyExpiringMemberships
);

router.get(
  "/:id",
  verifyJWT,
  getMembershipById
);

// admin actions 

router.post(
  "/",
  verifyJWT,
  verifyAdmin,
  validate(createMembershipFromPurchaseSchema),
  createMembership
);

// manual 

router.post(
  "/manual",
  verifyJWT,
verifyAdmin,
  validate(offlineMembershipSchema),
  createManualMembership
);

router.get(
  "/",
  verifyJWT,
  verifyAdmin,
  getAllMemberships
);

router.get(
  "/user/:userId",
  verifyJWT,
  verifyAdmin,
  getUserMemberships
);

router.patch(
  "/:id",
  verifyJWT,
  verifyAdmin,
  validate(updateMembershipSchema),
  updateMembership
);

router.delete(
  "/:id",
  verifyJWT,
  verifyAdmin,
  deleteMembership
);

export default router