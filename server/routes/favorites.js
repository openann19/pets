/**
 * Favorites Routes
 * 
 * Routes for managing user's favorite pets
 */

const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Add pet to favorites
router.post('/', favoritesController.addFavorite);

// Get user's favorites
router.get('/', favoritesController.getFavorites);

// Check if pet is favorited
router.get('/check/:petId', favoritesController.checkFavorite);

// Get pet's favorite count
router.get('/count/:petId', favoritesController.getPetFavoriteCount);

// Remove pet from favorites
router.delete('/:petId', favoritesController.removeFavorite);

module.exports = router;
