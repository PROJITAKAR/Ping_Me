import express from 'express';
import requireAuth from '../middlewares/authMiddleware.js';
import { createChat, getChats, getChat, rename, addUser, promote_admin, removeMember, demoteAdmin, leaveGroup   } from '../controllers/ChatController.js';
import attachIO from '../middlewares/socketMiddleware.js';


const router= express.Router();

router.post('/',requireAuth,attachIO, createChat);
router.get('/', requireAuth, getChats);
router.get('/:chatId', requireAuth, getChat);
router.patch('/rename/:chatId', requireAuth, rename);
router.patch('/addUser/:chatId', requireAuth, addUser);
router.patch('/promote_admin/:chatId', requireAuth, promote_admin);
router.patch('/remove_member/:chatId', requireAuth, removeMember);
router.patch('/demote_admin/:chatId', requireAuth, demoteAdmin);
router.patch('/leave_group/:chatId', requireAuth, leaveGroup);


export default router;