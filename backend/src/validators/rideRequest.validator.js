const Joi = require("joi");

const createRideRequestSchema = Joi.object({
  pickupLocation: Joi.string().trim().min(3).max(300).required().messages({
    "any.required": "Pickup location is required",
    "string.empty": "Pickup location is required",
    "string.min": "Pickup location must be at least 3 characters",
  }),

  pickupELoc: Joi.string().trim().min(1).max(50).required().messages({
    "any.required":
      "Pickup eLoc is required. Please select the pickup location from Mappls.",
    "string.empty":
      "Pickup eLoc is required. Please select the pickup location from Mappls.",
  }),

  pickupPlaceName: Joi.string().trim().max(300).allow(null, "").optional(),

  pickupPlaceAddress: Joi.string().trim().max(500).allow(null, "").optional(),

  destination: Joi.string().trim().min(3).max(300).required().messages({
    "any.required": "Destination is required",
    "string.empty": "Destination is required",
    "string.min": "Destination must be at least 3 characters",
  }),

  destinationELoc: Joi.string().trim().min(1).max(50).required().messages({
    "any.required":
      "Destination eLoc is required. Please select the destination from Mappls.",
    "string.empty":
      "Destination eLoc is required. Please select the destination from Mappls.",
  }),

  destinationPlaceName: Joi.string().trim().max(300).allow(null, "").optional(),

  destinationPlaceAddress: Joi.string()
    .trim()
    .max(500)
    .allow(null, "")
    .optional(),

  departureDate: Joi.date().required().messages({
    "any.required": "Departure date is required",
    "date.base": "Departure date must be a valid date",
  }),

  departureTime: Joi.string().trim().required().messages({
    "any.required": "Departure time is required",
    "string.empty": "Departure time is required",
  }),

  seatsRequired: Joi.number().integer().min(1).max(4).default(1).messages({
    "number.base": "Seats required must be a number",
    "number.integer": "Seats required must be a whole number",
    "number.min": "Seats required must be at least 1",
    "number.max": "Seats required cannot be more than 4",
  }),

  notes: Joi.string().trim().max(300).allow("").default(""),
});

const updateRideRequestSchema = Joi.object({
  pickupLocation: Joi.string().trim().min(3).max(300).optional(),

  pickupELoc: Joi.string().trim().min(1).max(50).optional().messages({
    "string.empty":
      "Pickup eLoc cannot be empty when updating the pickup location",
  }),

  pickupPlaceName: Joi.string().trim().max(300).allow(null, "").optional(),

  pickupPlaceAddress: Joi.string().trim().max(500).allow(null, "").optional(),

  destination: Joi.string().trim().min(3).max(300).optional(),

  destinationELoc: Joi.string().trim().min(1).max(50).optional().messages({
    "string.empty":
      "Destination eLoc cannot be empty when updating the destination",
  }),

  destinationPlaceName: Joi.string().trim().max(300).allow(null, "").optional(),

  destinationPlaceAddress: Joi.string()
    .trim()
    .max(500)
    .allow(null, "")
    .optional(),

  departureDate: Joi.date().optional(),

  departureTime: Joi.string().trim().optional(),

  seatsRequired: Joi.number().integer().min(1).max(4).optional().messages({
    "number.base": "Seats required must be a number",
    "number.integer": "Seats required must be a whole number",
    "number.min": "Seats required must be at least 1",
    "number.max": "Seats required cannot be more than 4",
  }),

  notes: Joi.string().trim().max(300).allow("").optional(),
}).min(1);

module.exports = {
  createRideRequestSchema,
  updateRideRequestSchema,
};
