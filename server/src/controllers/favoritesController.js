/**
 * Favorites Controller
 * 
 * Handles favoriting/unfavoriting pets and retrieving favorites list
 */

const Favorite = require('../models/Favorite');
const logger = require('../utils/logger');

/**
 * Add pet to favorites
 * POST /api/favorites
 */
exports.addFavorite = async (req, res) => {
    try {
        const { petId } = req.body;
        const userId = req.user._id;

        if (!petId) {
            return res.status(400).json({
                success: false,
                message: 'Pet ID is required',
            });
        }

        // Check if already favorited
        const existing = await Favorite.findOne({ userId, petId });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Pet already in favorites',
            });
        }

        // Create favorite
        const favorite = new Favorite({
            userId,
            petId,
        });

        await favorite.save();

        // Populate pet data for response
        await favorite.populate('petId', 'name breed age photos location');

        logger.info('Pet added to favorites', {
            userId,
            petId,
        });

        res.status(201).json({
            success: true,
            favorite,
            message: 'Pet added to favorites',
        });
    } catch (error) {
        logger.error('Error adding favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to add favorite',
        });
    }
};

/**
 * Remove pet from favorites
 * DELETE /api/favorites/:petId
 */
exports.removeFavorite = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user._id;

        const favorite = await Favorite.findOneAndDelete({ userId, petId });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found',
            });
        }

        logger.info('Pet removed from favorites', {
            userId,
            petId,
        });

        res.json({
            success: true,
            message: 'Pet removed from favorites',
        });
    } catch (error) {
        logger.error('Error removing favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to remove favorite',
        });
    }
};

/**
 * Get user's favorites
 * GET /api/favorites
 */
exports.getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 50, skip = 0 } = req.query;

        const favorites = await Favorite.getUserFavorites(userId, {
            limit: parseInt(limit, 10),
            skip: parseInt(skip, 10),
        });

        const totalCount = await Favorite.getUserFavoriteCount(userId);

        res.json({
            success: true,
            favorites,
            totalCount,
            hasMore: totalCount > parseInt(skip, 10) + favorites.length,
        });
    } catch (error) {
        logger.error('Error fetching favorites', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites',
        });
    }
};

/**
 * Check if pet is favorited
 * GET /api/favorites/check/:petId
 */
exports.checkFavorite = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user._id;

        const isFavorited = await Favorite.isFavorited(userId, petId);

        res.json({
            success: true,
            isFavorited,
        });
    } catch (error) {
        logger.error('Error checking favorite', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to check favorite status',
        });
    }
};

/**
 * Get pet's favorite count
 * GET /api/favorites/count/:petId
 */
exports.getPetFavoriteCount = async (req, res) => {
    try {
        const { petId } = req.params;

        const count = await Favorite.getPetFavoriteCount(petId);

        res.json({
            success: true,
            count,
        });
    } catch (error) {
        logger.error('Error getting favorite count', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to get favorite count',
        });
    }
};
