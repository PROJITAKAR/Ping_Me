import express from 'express';
import {RegisterController, LoginController, LogoutController, me} from '../controllers/AuthController.js';
import requireAuth from '../middlewares/authMiddleware.js'

const router= express.Router();

router.post('/register',RegisterController)

router.post('/login', LoginController)

router.post('/logout', LogoutController)

router.get('/me',requireAuth,me)


export default router;