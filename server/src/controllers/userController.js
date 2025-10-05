const User = require('../models/User');
const Pet = require('../models/Pet');
const Match = require('../models/Match');
const { deleteFromCloudinary, uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('pets');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, location, preferences } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio) user.bio = bio;
    if (location) user.location = { ...user.location, ...location };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({ success: true, message: 'Profile updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Upload user avatar
// @route   PUT /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file uploaded' });
        }

        // If user already has an avatar, delete the old one from Cloudinary
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        const result = await uploadToCloudinary(req.file.buffer, 'avatars');

        user.avatar = result.secure_url;
        user.avatarPublicId = result.public_id;
        await user.save();

        res.json({ success: true, message: 'Avatar uploaded successfully', data: { user: user.toJSON() } });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete all user's pets and their images
        const pets = await Pet.find({ owner: req.userId });
        for (const pet of pets) {
            for (const photo of pet.photos) {
                if (photo.publicId) await deleteFromCloudinary(photo.publicId);
            }
        }
        await Pet.deleteMany({ owner: req.userId });

        // Delete user's avatar
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        // Delete user's matches
        await Match.deleteMany({ $or: [{ user1: req.userId }, { user2: req.userId }] });

        // Delete user
        await User.findByIdAndDelete(req.userId);

        res.json({ success: true, message: 'Account deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.preferences = { ...user.preferences, ...req.body };
        await user.save();
        res.json({ success: true, message: 'Preferences updated', data: { preferences: user.preferences } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update user location
// @route   PUT /api/users/location
// @access  Private
const updateLocation = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.location = { ...user.location, ...req.body };
        await user.save();
        res.json({ success: true, message: 'Location updated', data: { location: user.location } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: { stats: user.analytics } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
  updatePreferences,
  updateLocation,
  getUserStats
};
