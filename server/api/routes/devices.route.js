const router = require('express').Router();

const Device = require('../models/Device.model');
const authVerify = require('../middleware/authentication.verification');
const adminVerify = require('../middleware/authorization.verification');
const bodyVal = require('../middleware/body.validation');

/**
 * List all devices. Filter by name with "name" query
 * @route GET /devices/
 * @group Devices
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} name.query - Name of a specific device to get.
 * @param {string} category.query - Category name of devices to fetch.
 * @returns {object} 200 - List off all available devices.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - Device with the requested name is not found.
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
      // Filter search devices based on the query parameters
      const findFilter = req.query;

      // Clear the findFilter object from keys containg empty-string values
      Object.keys(findFilter).forEach((key) => findFilter[key] === '' && delete findFilter[key]);

      // Fetch all devices (with details) from the database
      const devices = await Device.find(findFilter).populate('bookings').populate('users').exec();

      // No device(s) found
      if (!devices.length) {
        return res.status(404).json({ error: ['Device not found'] });
      }

      // Respond 200 with :devices:
      res.status(200).json({
        devices: devices,
        success: 'All requested devices have been listed',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the GET '/devices/' router",
      });
    }
  }
);

/**
 * @typedef Device
 * @property {string} name.required - Device's name. - eg: Raspberry Pi
 * @property {string} category - Device's category. - eg: Computers
 * @property {string} model - Device's model. - eg: 4C
 * @property {string} ram - Device's amount of RAM. - eg: 4 GB
 * @property {string} os - Device's running OS. - eg: Raspbian
 */
/**
 * [ADMIN] Post a new device.
 * @route POST /devices/
 * @group Devices
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {Device.model} device.body.required - New device's details.
 * @returns {object} 201 - Created device.
 * @returns {object} 400 - A device with the requested name is already registered.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 403 - User is not an admin.
 * @returns {object} 500 - Internal Server Error.
 */
router.post(
  '/',
  [
    // Authentication check
    authVerify,
    // Authorization check
    adminVerify,
  ],
  async (req, res) => {
    try {
      // Validation of the input data
      if (bodyVal(req, res)) {
        return;
      }

      const { name, category, model, ram, os } = req.body;
      // Validation that this is a new device
      const isRegistred = await Device.findOne({ name: name });
      if (isRegistred) {
        return res.status(400).json({ error: [`Device '${isRegistred.name}' is already added.`] });
      }

      // Add new device to our database
      const device = new Device({
        name: name,
        category: category,
        model: model,
        ram: ram,
        os: os,
      });
      const addedDevice = await device.save();

      // Respond 201 with :addedDevice:
      res.status(201).json({
        device: addedDevice,
        success: 'New device has been added',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the POST '/devices/' router",
      });
    }
  }
);

/**
 * [ADMIN] Remove a device by it's name.
 * @route DELETE /devices/{deviceName}
 * @group Devices
 * @param {string} x-auth-token.header.required - User's JWT.
 * @param {string} deviceName.path.required - Name of a device to remove.
 * @returns {object} 200 - Record of the deleted device.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 403 - User is not an admin.
 * @returns {object} 404 - The requested device is not found (has already been deleted).
 * @returns {object} 500 - Internal Server Error.
 */
router.delete(
  '/:deviceName',
  [
    // Authentication check
    authVerify,
    // Authorization check
    adminVerify,
  ],
  async (req, res) => {
    try {
      // Get device by its name
      const deletedDevice = await Device.findOneAndDelete({ name: req.params.deviceName });

      // No device found
      if (!deletedDevice) {
        return res.status(404).json({ error: [`Device '${req.params.deviceName}' not found`] });
      }

      // Respond 200 with :deletedDevice:
      res.status(200).json({
        device: deletedDevice,
        success: `Device "${deletedDevice.name}" has been successfully deleted`,
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the DELETE '/devices/:deviceName' router",
      });
    }
  }
);

/**
 * List all device categories.
 * @route GET /devices/categories
 * @group Devices
 * @param {string} x-auth-token.header.required - User's JWT.
 * @returns {object} 200 - List off all available device categories.
 * @returns {object} 401 - User's unauthorized.
 * @returns {object} 404 - Categories are not defined.
 * @returns {object} 500 - Internal Server Error.
 */
router.get(
  '/categories',
  [
    // Authentication check
    authVerify,
  ],
  async (req, res) => {
    try {
      // Fetch all device categories from the database
      const categories = await Device.find().distinct('category').exec();

      // No categories found
      if (!categories.length) {
        return res.status(404);
      }

      // Respond 200 with categories
      res.status(200).json({
        categories: categories,
        success: 'All categories have been listed',
      });
    } catch (error) {
      // Respond 500 with error message in the "error" key
      res.status(500).json({
        error: [error.message],
        message: "Internal server error in the GET '/devices/categories' router",
      });
    }
  }
);

// Export the router for "/api/v1/devices"
module.exports = router;
