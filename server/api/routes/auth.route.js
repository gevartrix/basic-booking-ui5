const router = require('express').Router();
const { check } = require('express-validator');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

const User = require('../models/User.model');
const authVerify = require('../middleware/authentication.verification');
const bodyVal = require('../middleware/body.validation');

// Load "JWT_SECRET_KEY" and "JWT_EXPIRES_IN"
dotenv.config();

/**
 * Fetch the current user and token information
 * @route GET /auth/
 * @group Authentication
 * @param {string} x-auth-token.header - User's JWT.
 * @returns {object} 200 - User's token and detailed information about the user.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - User not found.
 * @returns {object} 500 - Internal Server Error.
 */
router.get(
  '/',
  [
    // Authentication check
    authVerify,
  ],
  async (req, res) => {
    try {
      // Fetch the token from the request's header
      const token = req.header('x-auth-token');
      // Fetch user (with details) by ID from request (appended by the authentication middleware)
      const user = await User.findById(req.userId)
        .populate({ path: 'bookings', populate: { path: 'device', model: 'Device' } })
        .exec();

      // User not found
      if (!user) {
        return res.status(404).json({ error: `User '${req.userId}' not found` });
      }

      const bookings = user.bookings;
      // Respond 200 with :token: and :user:
      res.status(200).json({
        token: token,
        user: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin,
        },
        bookings: bookings,
        success: 'Information about the user has been fetched',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the GET '/auth/' router",
      });
    }
  }
);

/**
 * @typedef Login
 * @property {string} email.required - User's SAP e-mail address. - eg: jon.doe@sap.com
 */
/**
 * Login a user
 * @route POST /auth/
 * @group Authentication
 * @param {Login.model} login.body.required
 * @returns {object} 200 - User's token and detailed information about the user.
 * @returns {object} 404 - User with provided email is not found.
 * @returns {object} 500 - Internal Server Error.
 */
router.post(
  '/',
  [
    // Check that e-mail's format is `<first_name>.<last_name>@sap.com` (any caps register)
    check('email', 'Enter your SAP e-mail address.')
      .isEmail()
      .normalizeEmail()
      .matches(/^[A-Za-z]{2,}\.[-A-Za-z]{2,}@[Ss][Aa][Pp]\.[Cc][Oo][Mm]$/, 'i'),
  ],
  async (req, res) => {
    try {
      // Validation of the input data
      if (bodyVal(req, res)) {
        return;
      }

      // Validation that a user with provided e-mail exists in our database (i.e. has been registered)
      const { email } = req.body;
      const user = await User.findOne({ email })
        .populate({ path: 'bookings', populate: { path: 'device', model: 'Device' } })
        .exec();

      if (!user) {
        return res.status(404).json({ error: [`User '${email}' is not registered`] });
      }

      // Generate an auth token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      // res.header('x-auth-token', token);
      const bookings = user.bookings;
      // Respond 200 with :token: and :user:
      res.status(200).json({
        token: token,
        user: {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin,
        },
        bookings: bookings,
        success: 'User has logged in',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the POST '/auth/' router",
      });
    }
  }
);

/**
 * Validate user's token
 * @route POST /auth/token
 * @group Authentication
 * @param {string} x-auth-token.header - User's JWT.
 * @returns {boolean} 200 - Valid token.
 * @returns {boolean} 401 - No token provided or provided token is invalid.
 * @returns {boolean} 404 - User, associated with provided token is not found.
 * @returns {object} 500 - Internal Server Error.
 */
router.post('/token', async (req, res) => {
  try {
    const token = req.header('x-auth-token');

    // No token was provided
    if (!token) {
      return res.status(401).json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Token verification failed
    if (!verified) {
      return res.status(401).json(false);
    }

    // No user was found in the database
    const user = await User.findById(verified.userId);
    if (!user) {
      return res.status(404).json(false);
    }

    // Respond 200 with "true"
    res.status(200).json(true);
  } catch (error) {
    // Respond 500
    res.status(500).json({ error });
  }
});

// Export the router for "/api/v1/auth"
module.exports = router;
