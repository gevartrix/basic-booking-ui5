const router = require('express').Router();
const { check } = require('express-validator');

const Booking = require('../models/Booking.model');
const Device = require('../models/Device.model');
const User = require('../models/User.model');
const authVerify = require('../middleware/authentication.verification');
const adminVerify = require('../middleware/authorization.verification');
const bodyVal = require('../middleware/body.validation');

const dateConfirm = async (device, from, to, bookingId = null) => {
  // Check that :from: and :to: are agreed
  if (from > to) {
    return ["The 'from' date is later than the 'to' date"];
  }

  // Fetch a list of device's current bookings
  const currentBookings = await Booking.find({
    device: device._id,
    accepted: true,
  });
  const errors = [];
  // Iterate on the each booking and check that the dates don't intersect
  for (const booking of currentBookings) {
    // Ignore the dates of a booking with :bookingId: (for editing an existing booking)
    if (bookingId && Object.entries(bookingId).toString() === Object.entries(booking._id).toString()) {
      continue;
    }
    // Store just one set of errors for a single device
    if (errors.length === 2) {
      break;
    }
    // The :from: date is inbetween another booking for the device
    if (booking.from <= from && from <= booking.to) {
      errors.push(
        `Device '${
          device.name
        }' is already reserved for the chosen period. Try changing the booking date (${from.toLocaleDateString()})`
      );
    }
    // The :to: date is inbetween another booking for the device
    if (booking.from <= to && to <= booking.to) {
      errors.push(
        `Device '${
          device.name
        }' is already reserved for the chosen period. Try changing the return date (${to.toLocaleDateString()})`
      );
    }
  }

  return errors;
};

/**
 * Fetch all accepted bookings of the current user
 * @route GET /bookings/
 * @group Bookings
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} id.query - ID of a specific booking to get.
 * @returns {object} 200 - List off all user's bookings.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - Booking with the requested ID is not found.
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
      // Initialize a filter to search dates on a specific device only
      const findFilter = {
        user: req.userId,
        pending: false,
        accepted: true,
      };
      // If "device" query parameter is provided, fetch a device by the given name
      if (req.query.id) {
        findFilter._id = req.query.id;
      }
      // Fetch all bookings based on the filter and fill the `device` fields
      const bookings = await Booking.find(findFilter).populate('user').populate('device').exec();

      // No booking(s) found
      if (req.query.id && !bookings.length) {
        return res.status(404).json({ error: ['Booking not found'] });
      }

      // Generate an object for every booking and add it to an array
      const userBookings = [];
      for (const booking of bookings) {
        userBookings.push({
          id: booking._id,
          device: booking.device,
          from: booking.from,
          to: booking.to,
        });
      }
      // Respond 200 with :userBookings:
      res.status(200).json({
        bookings: userBookings,
        success: 'Your bookings have been fetched',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the GET '/bookings/' router",
      });
    }
  }
);

/**
 * @typedef Booking
 * @property {string} device.required - A device to book. - eg: Raspberry Pi
 * @property {string} from.required - The "from" date in the "MM/DD/YYYY" format. - eg: 01/01/2020
 * @property {string} to.required - The "to" date in the "MM/DD/YYYY" format. - eg: 01/02/2020
 */
/**
 * Request new booking.
 * @route POST /bookings/
 * @group Bookings
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {Booking.model} booking.body.required - The booking's details.
 * @returns {object} 201 - Record of the created booking.
 * @returns {object} 400 - There are invalid dates provided, or the device is already booked for the requested period.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - The requested device is not found.
 * @returns {object} 500 - Internal Server Error.
 */
router.post(
  '/',
  [
    // Authentication check
    authVerify,
    // Check the "device" field
    check('device').not().isEmpty().withMessage('Device has not been selected'),
    // Check the dates fields
    // Since a daterange picker is used on the front-end, it's suffice to check just one of the fields
    check('from').not().isEmpty().withMessage('').withMessage('Booking dates have not been provided'),
  ],
  async (req, res) => {
    try {
      // Validation of the input data
      if (bodyVal(req, res)) {
        return;
      }

      // Fetch user by ID from request (appended by the authentication middleware)
      const user = await User.findById(req.userId);
      // Fetch the booking data
      const device = await Device.findOne({ name: req.body.device });
      const dateFrom = new Date(req.body.from);
      const dateTo = new Date(req.body.to);

      // Device not found
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Check that the device is available for booking in requested time period
      const dateCollision = await dateConfirm(device, dateFrom, dateTo);
      if (dateCollision.length) {
        return res.status(400).json({ error: dateCollision });
      }

      // Create a new Booking item and store it in the temp array
      const booking = new Booking({
        user: user._id,
        device: device._id,
        from: dateFrom,
        to: dateTo,
      });

      // Everything is agreed, so empty the user's cart, create all the bookings and connect it to the user
      const newBooking = await booking.save();
      user.bookings.push(newBooking._id);
      await user.save();

      // Respond 201 with :newBooking:
      res.status(201).json({
        message: `Your booking request for "${device.name}" has been sent to the admins`,
        success: `Successfully booked device "${device.name}". Check Your Bookings to edit it, give feedback on the device and return it`,
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the POST '/bookings/' router",
      });
    }
  }
);

/**
 * Remove a booking by it's ID.
 * @route DELETE /bookings/{bookingId}
 * @group Bookings
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} bookingId.path.required - ID of a booking to remove.
 * @returns {object} 200 - Record of the deleted booking.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - The requested booking is not found (has already been deleted).
 * @returns {object} 500 - Internal Server Error.
 */
router.delete(
  '/:bookingId',
  [
    // Authentication check
    authVerify,
  ],
  async (req, res) => {
    try {
      // Fetch and delete booking by its ID
      const deletedBooking = await Booking.findOneAndDelete({ _id: req.params.bookingId, user: req.userId });

      // No booking found
      if (!deletedBooking) {
        return res.status(404).json({ error: [`Booking '${req.params.bookingId}' not found`] });
      }

      // Also disconnect the booking from the `user` and `device` collections
      const user = await User.findById(deletedBooking.user);
      const device = await Device.findById(deletedBooking.device);
      user.bookings.pull(deletedBooking._id);
      device.bookings.pull(deletedBooking._id);
      await user.save();
      await device.save();

      // Respond 200 with :deletedBooking:
      res.status(200).json({
        booking: deletedBooking,
        success: `Booking of device "${device.name}" has been successfully deleted`,
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the DELETE '/bookings/:bookingId' router",
      });
    }
  }
);

/**
 * [ADMIN] Fetch all pending bookings
 * @route GET /bookings/pending
 * @group Bookings
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} id.query - ID of a specific booking to get.
 * @returns {object} 200 - List off all user's bookings.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 403 - User is not an admin.
 * @returns {object} 404 - Booking with the requested ID is not found.
 * @returns {object} 500 - Internal Server Error.
 */
router.get(
  '/pending',
  [
    // Authentication check
    authVerify,
    adminVerify,
  ],
  async (req, res) => {
    try {
      // Initialize a filter to search dates on a specific device only
      const findFilter = {
        pending: true,
      };
      // If "device" query parameter is provided, fetch a device by the given name
      if (req.query.id) {
        findFilter._id = req.query.id;
      }

      // Fetch all bookings based on the filter and fill the `device` fields
      const pendingBookings = await Booking.find(findFilter).populate('device').populate('user').exec();

      // No booking(s) found
      if (req.query.id && !pendingBookings.length) {
        return res.status(404).json({ error: ['Booking not found'] });
      }

      // Generate an object for every booking and add it to an array
      const userBookings = [];
      for (const booking of pendingBookings) {
        const userFullName = booking.user.first_name + ' ' + booking.user.last_name;
        userBookings.push({
          id: booking._id,
          name: booking.device.name,
          user: userFullName,
          from: booking.from.toLocaleString(),
          to: booking.to.toLocaleString(),
        });
      }
      // Respond 200 with :userBookings:
      res.status(200).json({
        bookings: userBookings,
        success: 'All pending bookings have been fetched',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the GET '/bookings/' router",
      });
    }
  }
);

/**
 * [ADMIN] Manage the pending bookings
 * @route PATCH /bookings/{bookingId}/{ok}
 * @group Bookings
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} id.query.required - ID of a specific booking to manage.
 * @param {string} ok.path.required - Approve/deny the request.
 * @returns {object} 200 - List off all user's bookings.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 403 - User is not an admin.
 * @returns {object} 500 - Internal Server Error.
 */
router.patch('/:bookingId/:ok', [authVerify, adminVerify], async (req, res) => {
  try {
    const updatedData = {
      pending: false,
    };
    let message = 'Request has been denied';
    if (req.params.ok === 'ok') {
      updatedData.accepted = true;
      message = 'Request has been approved';
    }
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.bookingId, updatedData, {
      useFindAndModify: false,
      returnOriginal: false,
    });
    // Respond 200 with :updatedBooking:
    res.status(200).json({
      booking: updatedBooking,
      success: message,
    });
  } catch (error) {
    // Respond 500 with error message in the "error" key
    res.status(500).json({
      error: [error.message],
      message: "Internal server error in the PATCH '/bookings/:bookingId' router",
    });
  }
});

// Export the router for '/api/bookings'
module.exports = router;
