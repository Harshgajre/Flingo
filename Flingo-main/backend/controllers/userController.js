import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username name profilePic')
      .populate('following', 'username name profilePic');
      
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name !== undefined ? req.body.name : user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.location = req.body.location !== undefined ? req.body.location : user.location;
      user.website = req.body.website !== undefined ? req.body.website : user.website;
      
      if (req.files) {
        if (req.files.profilePic) {
          user.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
        }
        if (req.files.coverPic) {
          user.coverPic = `/uploads/${req.files.coverPic[0].filename}`;
        }
      } else {
        if (req.body.profilePic) user.profilePic = req.body.profilePic;
        if (req.body.coverPic) user.coverPic = req.body.coverPic;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        profilePic: updatedUser.profilePic,
        coverPic: updatedUser.coverPic,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        followers: updatedUser.followers,
        following: updatedUser.following,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Follow or unfollow user
// @route   POST /api/users/follow/:id
// @access  Private
const followUnfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      res.status(400);
      throw new Error('You cannot follow yourself');
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404);
      throw new Error('User not found');
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, { $push: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $push: { followers: currentUserId } });

      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow'
      });

      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bookmark or unbookmark a post
// @route   POST /api/users/bookmark/:postId
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.postId;
    
    if (user.bookmarks.includes(postId)) {
        user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
        await user.save();
        res.json({ message: 'Post unbookmarked', bookmarks: user.bookmarks });
    } else {
        user.bookmarks.push(postId);
        await user.save();
        res.json({ message: 'Post bookmarked', bookmarks: user.bookmarks });
    }
  } catch (err) {
    next(err);
  }
}

// @desc    Search users
// @route   GET /api/users/search?query=...
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('name username profilePic');

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export { getUserProfile, updateUserProfile, followUnfollowUser, toggleBookmark, searchUsers };
