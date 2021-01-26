const dotenv = require('dotenv');

const User = require('../models/User.model');

// Load "ADMIN_EMAIL"
dotenv.config();

// API middleware for checking the user's privileges
const adminVerify = async (req, res, next) => {
  try {
    // Get user's e-mail by the ID from request (appended by the authentication middleware)
    const { email } = await User.findById(req.userId);

    // Check that user's e-mail and admin's e-mail are identical. Proceed on success, return 403 on failure
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ error: [`User '${req.userId}' is not an admin`] });
    }

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Respond 500 with error message in the "error" key
    res.status(500).json({
      error: [error.message],
      message: "Internal server error in the 'authorization' middleware",
    });
  }
};

module.exports = adminVerify;
