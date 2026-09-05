import {Router} from 'express'
import {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser} from '../controller/user.controller.js'
import {validate} from '../middlwares/validate.middleware.js'
import {registerSchema,loginSchema} from '../validators/user.validator.js'
import {verifyJWT} from '../middlwares/auth.middleware.js'


const router = Router();

router.route("/register").post(
    validate(registerSchema),
    registerUser
);

router.route("/login").post(validate(loginSchema),loginUser)

router.use(verifyJWT);

router.route("/current-user").get(getCurrentUser)
router.route("/logout").delete(logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/change-password").post(changePassword)



export default router;