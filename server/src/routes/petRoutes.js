const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { getPets, discoverPets, createPet, updatePet, deletePet, getPetById } = require('../controllers/petController');
const { advancedPetSearch } = require('../controllers/advancedPetController');

// Apply auth to protected routes
router.use(authenticateToken);

// Basic pet routes
router.get('/', getPets);
router.get('/discover', discoverPets); // Now protected
router.post('/', createPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);
router.get('/:id', getPetById);

// Advanced search (protected)
router.post('/search/advanced', advancedPetSearch);

module.exports = router;
