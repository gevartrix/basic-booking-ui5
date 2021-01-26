const { Schema, Types, model } = require('mongoose');

const bookingSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    device: {
      type: Types.ObjectId,
      ref: 'Device',
      required: true,
    },
    from: {
      type: Date,
      default: Date.now,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    pending: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const timezone = require('mongoose-timezone');
bookingSchema.plugin(timezone, { paths: ['from', 'to'] });

module.exports = model('Booking', bookingSchema);
