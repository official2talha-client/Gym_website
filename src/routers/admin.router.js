import { Router } from "express";

import {
  getAllUsers,
  changeUserStatus,
  getUserById,
  getPurchaseStatistics,
  getTotalRevenue,
  getNewUsers,
  createBusiness,
  getMyBusiness,
  updateBusiness,
  getAdminActionRecords
} from "../controller/admin.controller.js";

import { verifyJWT } from "../middlwares/auth.middleware.js";
import { verifyAdmin } from "../middlwares/admin.middleware.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin)

// business router 

router.post("/", createBusiness);

router.get("/my", getMyBusiness);

router.patch("/", updateBusiness);


// users router 

router.get("/users", getAllUsers);

router.get("/usersbyId/:id", getUserById);

router.post("/change-userStatus/:id", changeUserStatus);


// purchase router 

router.get(
  "/statistics",
  getPurchaseStatistics
);


// dashboard routers 

router.get(
  "/revenue",
  getTotalRevenue
);

router.get(
  "/newUser",
  getNewUsers
);

router.get(
  "/action-records",
  getAdminActionRecords
);



export default router;