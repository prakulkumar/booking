import Joi from "joi-browser";

const roomsSchema = Joi.object().keys({
  roomType: Joi.string()
    .required()
    .label("Room Type"),
  roomNumber: Joi.required().label("Room Number")
});

export default {
  bookingFormSchema: {
    firstName: Joi.string()
      .required()
      .label("First Name"),
    lastName: Joi.string()
      .required()
      .label("Last Name"),
    address: Joi.string()
      .required()
      .label("Address"),
    checkIn: Joi.date()
      .required()
      .label("Check In"),
    checkOut: Joi.date()
      .required()
      .label("Check Out"),
    adults: Joi.number()
      .required()
      .label("Adults"),
    children: Joi.number()
      .required()
      .label("Children"),
    contactNumber: Joi.number()
      .min(1000000000)
      .max(9999999999)
      .required()
      .label("Contact Number"),
    roomCharges: Joi.number()
      .required()
      .label("Room Charges"),
    advance: Joi.number()
      .required()
      .label("Advance"),
    rooms: Joi.array()
      .items(roomsSchema)
      .unique()
      .required()
  },
  billingFormSchema: {
    card: Joi.number(),
    cash: Joi.number(),
    wallet: Joi.number()
  }
};
