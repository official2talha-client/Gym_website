import {Router} from 'express'
import {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,changeUserStatus,getAllUsers,getCurrentUser,getUserById} from '../controller/user.controller.js'
import {validate} from '../middlwares/validate.middleware.js'
import {userValidationSchema} from '../validators/user.validator.js'
import {verifyJWT} from '../middlwares/auth.middleware.js'


const router = Router();

router.route("/register").post(
    validate(userValidationSchema),
    registerUser
);

router.route("/login").post(loginUser)

router.use(verifyJWT);

router.route("/current-user").get(getCurrentUser)
router.route("/logout").delete(logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/change-password").post(changePassword)
router.route("/change-status/:id").post(changeUserStatus)

router.route("/get-userbyId/:id").get(getUserById)
router.route("/get-allusers").get(getAllUsers)


export default router;