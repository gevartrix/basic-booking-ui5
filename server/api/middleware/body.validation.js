const { validationResult } = require('express-validator');

const bodyVal = (req, res) => {
  try {
    const validationErrors = validationResult(req);

    // For any errors populate an array for our front-end and return it under the "error" key
    if (!validationErrors.isEmpty()) {
      const errorsArray = validationErrors.array({ onlyFirstError: true });
      const errors = [];

      for (const error of errorsArray) {
        errors.push(error.msg);
      }

      return res.status(400).json({ error: errors });
    }
  } catch (error) {
    // Return Internal server error
    return res.status(500).json({
      error: [error.message],
      message: "Internal server error in the 'bodyValidation' middleware",
    });
  }
};

module.exports = bodyVal;
