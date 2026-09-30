import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  followUnfollowUser,
  toggleBookmark,
  searchUsers,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.put('/update', protect, upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPic', maxCount: 1 }]), updateUserProfile);
router.post('/follow/:id', protect, followUnfollowUser);
router.post('/bookmark/:postId', protect, toggleBookmark);
router.get('/search', searchUsers);
router.get('/:username', getUserProfile);

export default router;
