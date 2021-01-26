const { Schema, Types, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      min: 11,
      max: 255,
    },
    first_name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    last_name: {
      type: String,
      required: true,
      min: 2,
      max: 255,
    },
    is_admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    bookings: [
      {
        type: Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'registered_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = model('User', userSchema);
