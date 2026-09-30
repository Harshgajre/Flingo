import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Create a post
// @route   POST /api/posts/create
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    let media = [];

    if (req.files && req.files.length > 0) {
      media = req.files.map(file => `/uploads/${file.filename}`);
    }

    if (!content && media.length === 0) {
      res.status(400);
      throw new Error('Post must contain text or media');
    }

    const post = new Post({
      user: req.user._id,
      content,
      media,
    });

    const createdPost = await post.save();
    
    // Populate user details for immediate frontend use
    await createdPost.populate('user', 'name username profilePic');

    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get home feed posts
// @route   GET /api/posts/feed
// @access  Private
export const getFeedPosts = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Include user's own posts and posts from people they follow
    const usersToFetch = [...currentUser.following, currentUser._id];

    const posts = await Post.find({ user: { $in: usersToFetch } })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePic')
      .populate('comments.user', 'name username profilePic');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked posts
// @route   GET /api/posts/bookmarks
// @access  Private
export const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find({ _id: { $in: user.bookmarks } })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePic')
      .populate('comments.user', 'name username profilePic');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get explore posts
// @route   GET /api/posts/explore
// @access  Public (or Private)
export const getExplorePosts = async (req, res, next) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name username profilePic')
      .populate('comments.user', 'name username profilePic');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:username
// @access  Private
export const getUserPosts = async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      res.status(404);
      throw new Error('User not found');
    }

    const posts = await Post.find({ user: targetUser._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePic')
      .populate('comments.user', 'name username profilePic');
      
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's liked posts
// @route   GET /api/posts/liked/:username
// @access  Private
export const getLikedPosts = async (req, res, next) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username });
    if (!targetUser) {
      res.status(404);
      throw new Error('User not found');
    }

    const posts = await Post.find({ likes: targetUser._id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profilePic')
      .populate('comments.user', 'name username profilePic');
      
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/posts/like/:id
// @access  Private
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      await post.save();
      res.json({ message: 'Post unliked', likes: post.likes });
    } else {
      // Like
      post.likes.push(req.user._id);
      await post.save();

      // Create Notification
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id
        });
      }

      res.json({ message: 'Post liked', likes: post.likes });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/comment/:id
// @access  Private
export const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const comment = {
      user: req.user._id,
      text,
    };

    post.comments.push(comment);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id
      });
    }

    await post.populate('comments.user', 'name username profilePic');

    res.status(201).json(post.comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};
