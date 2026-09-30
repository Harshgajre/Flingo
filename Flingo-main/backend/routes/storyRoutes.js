import express from 'express';
import { createStory, getFeedStories, deleteStory } from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/create', protect, upload.fields([{ name: 'media', maxCount: 1 }]), createStory);
router.get('/feed', protect, getFeedStories);
router.delete('/:id', protect, deleteStory);

export default router;
