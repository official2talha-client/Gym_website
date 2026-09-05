import express from "express";

import {
 createMembership,
 deleteMembership,
 getAllMemberships,
 getMembershipById,
 getMyMembership,
 getUserMemberships,
 updateMembership
} from "../controller/membership.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
// import   from "../middlwares/admin.middleware.js";
import {createMembershipSchema,updateMembershipSchema} from '../validators/membership.validator.js'
import { validate } from "../middlwares/validate.middleware.js";


const router = express.Router();

router.post(
  "/",
  verifyJWT,
//   isAdmin,
  validate(createMembershipSchema),
  createMembership
);

router.get(
  "/",
  verifyJWT,
//   isAdmin,
  getAllMemberships
);

router.get(
  "/my",
  verifyJWT,
  getMyMembership
);

router.get(
  "/user/:userId",
  verifyJWT,
//   isAdmin,
  getUserMemberships
);

router.get(
  "/:id",
  verifyJWT,
  getMembershipById
);

router.patch(
  "/:id",
  verifyJWT,
//   isAdmin,
  validate(updateMembershipSchema),
  updateMembership
);

router.delete(
  "/:id",
  verifyJWT,
//   isAdmin,
  deleteMembership
);

export default router