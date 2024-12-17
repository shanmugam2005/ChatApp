const express = require('express');
const { registerUser, allUsers, authUser } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for user registration and fetching all users (requires authentication)
router.route('/').post(registerUser).get(protect, allUsers);

// Route for user login
router.post('/login', authUser);



module.exports = router;
