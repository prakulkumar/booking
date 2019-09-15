const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const { findAll, findByObj, correctMonthAndYear } = require("./data");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");

dataBaseConnection().then(dbs => {
  router.get("/rooms", cors(), (req, res) => {
    try {
      findAll(dbs, collections.room).then(result => res.send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/rooms/available/timestamp", cors(), async (req, res) => {
    try {
      const basicCheckIn = moment.unix(req.body.checkIn).toDate();
      const basicCheckOut = moment.unix(req.body.checkOut).toDate();

      let checkIn = momentTimeZone.tz(basicCheckIn, "Asia/Kolkata").format();
      let checkOut = momentTimeZone.tz(basicCheckOut, "Asia/Kolkata").format();

      let diffrenceInMonth = moment(checkOut).month() - moment(checkIn).month();

      let bookings = [],
        filteredRooms = [];

      for (let index = 0; index <= diffrenceInMonth; index++) {
        let obj = correctMonthAndYear(
          moment(checkIn).month() + index,
          moment(checkIn).year()
        );
        const filter = {
          months: {
            $elemMatch: obj
          },
          checkedOut: false,
          cancel: false
        };
        result = await findByObj(dbs, collections.booking, filter);
        bookings = result.length > 0 ? bookings.concat(result) : bookings;
      }

      if (req.body.bookingId !== null) {
        bookings = bookings.filter(
          booking => booking._id.toString() !== req.body.bookingId.toString()
        );
      }

      bookings.forEach(booking => {
        let isCheckInInclude = false,
          isCheckOutInclude = false;

        let bookingCheckIn = momentTimeZone
          .tz(booking.checkIn, "Asia/Kolkata")
          .format();

        let bookingCheckOut = momentTimeZone
          .tz(booking.checkOut, "Asia/Kolkata")
          .format();

        let checkInCheck = moment(checkIn).isBetween(
          bookingCheckIn,
          bookingCheckOut
        );

        let checkOutCheck = moment(checkOut).isBetween(
          bookingCheckIn,
          bookingCheckOut
        );

        if (
          moment(checkIn).format("DD.MM.YYYY") ===
            moment(bookingCheckIn).format("DD.MM.YYYY") ||
          moment(checkIn).format("DD.MM.YYYY") ===
            moment(bookingCheckOut).format("DD.MM.YYYY")
        ) {
          isCheckInInclude = true;
        }

        if (
          moment(checkOut).format("DD.MM.YYYY") ===
            moment(bookingCheckIn).format("DD.MM.YYYY") ||
          moment(checkOut).format("DD.MM.YYYY") ===
            moment(bookingCheckOut).format("DD.MM.YYYY")
        ) {
          isCheckOutInclude = true;
        }

        if (
          checkInCheck ||
          checkOutCheck ||
          isCheckInInclude ||
          isCheckOutInclude
        )
          filteredRooms = filteredRooms.concat([...booking.rooms]);
      });

      filteredRooms = [...new Set(filteredRooms)];

      const allRooms = await findAll(dbs, collections.room);

      const availableRooms = allRooms.filter(room => {
        return filteredRooms.indexOf(room._id.toString()) < 0;
      });

      res.send(availableRooms);
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = router;
