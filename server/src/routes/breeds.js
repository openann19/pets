const express = require('express');
const router = express.Router();
const {
  getBreeds,
  getBreed,
  getBreedSuggestions,
  autocompleteBreeds,
  getBreedStats
} = require('../controllers/breedController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', getBreeds); // Get all breeds with filtering
router.get('/stats', getBreedStats); // Get breed statistics
router.get('/search/autocomplete', autocompleteBreeds); // Autocomplete breeds
router.get('/:name', getBreed); // Get specific breed details

// Protected routes (require authentication)
router.post('/suggestions', authenticateToken, getBreedSuggestions); // Get personalized breed suggestions

module.exports = router;
