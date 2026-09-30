import Story from '../models/Story.js';
import User from '../models/User.js';

export const createStory = async (req, res, next) => {
  try {
    if (!req.files || !req.files.media) {
      res.status(400);
      throw new Error('Please provide media for the story');
    }

    const mediaUrl = `/uploads/${req.files.media[0].filename}`;

    const story = await Story.create({
      user: req.user._id,
      media: mediaUrl
    });

    const populatedStory = await Story.findById(story._id).populate('user', 'name username profilePic');

    res.status(201).json(populatedStory);
  } catch (error) {
    next(error);
  }
};

export const getFeedStories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const following = user.following;
    following.push(req.user._id); // Include user's own stories

    const stories = await Story.find({ user: { $in: following } })
      .populate('user', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json(stories);
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      res.status(404);
      throw new Error('Story not found');
    }

    if (story.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this story');
    }

    await story.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};
