import {createPlan,deletePlan,filterPlans,getAllPlans,getPlanById,updatePlan} from '../controller/plan.controller.js'
import {Router} from 'express'

import { verifyJWT } from "../middlwares/auth.middleware.js";
// import { verifyAdmin } from "../middlwares/admin.middleware.js";

import {validate} from "../middlwares/validate.middleware.js";

import {
 planValidationSchema,updatePlanSchema
} from "../validators/plan.validator.js";

const router = Router();

// Public Routes
router.get("/get-all", getAllPlans);
router.get("/filter", filterPlans);
router.get("/get-byId/:id", getPlanById);

// Admin Routes
router.post(
  "/",
  verifyJWT,
//   verifyAdmin,
  validate(planValidationSchema),
  createPlan
);

router.patch(
  "/update/:id",
  verifyJWT,
//   verifyAdmin,
  validate(updatePlanSchema),
  updatePlan
);

router.delete(
  "/delete/:id",
  verifyJWT,
//   verifyAdmin,
  deletePlan
);

export default router;