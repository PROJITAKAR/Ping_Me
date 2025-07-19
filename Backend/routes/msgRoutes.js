import express from 'express';
import requireAuth from '../middlewares/authMiddleware.js';
import { createMessage, deleteMessageForMe, deleteMessageForEveryone } from '../controllers/MessageController.js';
import upload from '../config/multerConfig.js'
import attachIO from '../middlewares/socketMiddleware.js';

const router= express.Router();

router.post('/', requireAuth,attachIO,upload.single('attachment'), createMessage);
router.delete("/deleteMessageForMe/:id", requireAuth, deleteMessageForMe);
router.delete("/deleteMessageForEveryone/:id", requireAuth,attachIO, deleteMessageForEveryone);

export default router;