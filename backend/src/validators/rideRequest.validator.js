const Joi = require("joi");

const coordinatesSchema =
  Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),

    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required(),
  });

const createRideRequestSchema =
  Joi.object({
    pickupLocation: Joi.string()
      .trim()
      .min(3)
      .max(300)
      .required()
      .messages({
        "string.empty":
          "Pickup location is required",
      }),

    pickupELoc: Joi.string()
      .trim()
      .allow(null, "")
      .max(20)
      .optional(),

    /*
     * Frontend no longer needs to provide
     * coordinates.
     *
     * Backend resolves them.
     */
    pickupCoordinates:
      coordinatesSchema.optional(),

    destination: Joi.string()
      .trim()
      .min(3)
      .max(300)
      .required()
      .messages({
        "string.empty":
          "Destination is required",
      }),

    destinationELoc: Joi.string()
      .trim()
      .allow(null, "")
      .max(20)
      .optional(),

    destinationCoordinates:
      coordinatesSchema.optional(),

    departureDate: Joi.date()
      .required()
      .messages({
        "any.required":
          "Departure date is required",
      }),

    departureTime: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty":
          "Departure time is required",
      }),

    seatsRequired: Joi.number()
      .integer()
      .min(1)
      .max(4)
      .default(1),

    notes: Joi.string()
      .allow("")
      .max(300)
      .default(""),
  });

const updateRideRequestSchema =
  Joi.object({
    pickupLocation: Joi.string()
      .trim()
      .min(3)
      .max(300),

    pickupELoc: Joi.string()
      .trim()
      .allow(null, "")
      .max(20),

    pickupCoordinates:
      coordinatesSchema,

    destination: Joi.string()
      .trim()
      .min(3)
      .max(300),

    destinationELoc: Joi.string()
      .trim()
      .allow(null, "")
      .max(20),

    destinationCoordinates:
      coordinatesSchema,

    departureDate: Joi.date(),

    departureTime: Joi.string()
      .trim(),

    seatsRequired: Joi.number()
      .integer()
      .min(1)
      .max(4),

    notes: Joi.string()
      .allow("")
      .max(300),
  });

module.exports = {
  createRideRequestSchema,
  updateRideRequestSchema,
};