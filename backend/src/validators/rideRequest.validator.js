const Joi = require("joi");

const createRideRequestSchema = Joi.object({
  pickupLocation: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Pickup location is required",
  }),

  destination: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Destination is required",
  }),

  departureDate: Joi.date().required().messages({
    "any.required": "Departure date is required",
  }),

  departureTime: Joi.string().required().messages({
    "string.empty": "Departure time is required",
  }),

  seatsRequired: Joi.number().integer().min(1).max(5).default(1),

  notes: Joi.string().allow("").max(300),

  pickupCoordinates: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).optional(),

  destinationCoordinates: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).optional(),
});

const updateRideRequestSchema = Joi.object({
  pickupLocation: Joi.string().trim().min(3).max(100),

  destination: Joi.string().trim().min(3).max(100),

  departureDate: Joi.date(),

  departureTime: Joi.string(),

  seatsRequired: Joi.number().integer().min(1).max(5),

  notes: Joi.string().allow("").max(300),
});

module.exports = {
  createRideRequestSchema,
  updateRideRequestSchema,
};
