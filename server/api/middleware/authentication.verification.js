const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load "JWT_SECRET_KEY"
dotenv.config();

// API middleware for checking user's authentication status
const authVerify = (req, res, next) => {
  try {
    // Get user's token from the request's header
    const token = req.header('x-auth-token');

    // No token provided
    if (!token) {
      return res.status(401).json({ error: ['No token provided'] });
    }

    // Check token's validity. Get the user's ID on success, return 401 on failure
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!userId) {
      return res.status(401).json({ error: ['Provided token is invalid'] });
    }

    // Append user's ID to the request
    req.userId = userId;

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Respond 500 with error message in the "error" key
    res.status(500).json({
      error: [error.message],
      message: "Internal server error in the 'authentication' middleware",
    });
  }
};

module.exports = authVerify;
