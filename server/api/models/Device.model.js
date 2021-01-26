const { Schema, Types, model } = require('mongoose');

const deviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      min: 4,
      max: 255,
    },
    category: {
      type: String,
      required: true,
      default: 'Not specified',
      min: 2,
      max: 255,
    },
    model: {
      type: String,
      required: true,
      default: 'Not specified',
      min: 2,
      max: 255,
    },
    ram: {
      type: String,
      required: true,
      default: 'Not specified',
      min: 2,
      max: 255,
    },
    os: {
      type: String,
      required: true,
      default: 'Not specified',
      min: 2,
      max: 255,
    },
    bookings: [
      {
        type: Types.ObjectId,
        ref: 'Booking',
      },
    ],
    users: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = model('Device', deviceSchema);
