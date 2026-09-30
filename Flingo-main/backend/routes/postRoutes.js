import express from 'express';
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getBookmarks,
  toggleLikePost,
  commentPost,
  deletePost,
  getUserPosts,
  getLikedPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/feed', protect, getFeedPosts);
router.get('/explore', protect, getExplorePosts);
router.get('/bookmarks', protect, getBookmarks);
router.get('/user/:username', protect, getUserPosts);
router.get('/liked/:username', protect, getLikedPosts);
router.post('/create', protect, upload.array('media', 4), createPost);
router.delete('/:id', protect, deletePost);
router.post('/like/:id', protect, toggleLikePost);
router.post('/comment/:id', protect, commentPost);

export default router;
