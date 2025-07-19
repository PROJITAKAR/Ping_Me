// routes/userRoutes.js
import express from "express";
import requireAuth from "../middlewares/authMiddleware.js";
import { getAllUsers ,updateProfilepic, updateUsername, updateBio} from "../controllers/userController.js";
import attachIO from '../middlewares/socketMiddleware.js';
import upload from '../config/multerConfig.js'

const router = express.Router();

router.get("/alluser", requireAuth, getAllUsers);
router.patch("/updateProfilepic",requireAuth,attachIO,upload.single('profilePic'),updateProfilepic);
router.patch('/updateBio', requireAuth,attachIO, updateBio);
router.patch('/updateUsername', requireAuth,attachIO, updateUsername);
export default router;
