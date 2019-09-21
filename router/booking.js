const express = require("express");
const cors = require("cors");

const router = new express.Router();
const dataBaseConnection = require("./dataBaseConnection");
const collections = require("../constant").collections;
const ObjectID = require("mongodb").ObjectID;
const moment = require("moment");

const {
  findAll,
  findByObj,
  insertOne,
  updateOne,
  correctMonthAndYear
} = require("./data");

dataBaseConnection().then(dbs => {
  router.get("/bookings", cors(), async (req, res) => {
    try {
      findAll(dbs, collections.booking).then(result => res.send(result));
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/bookings/filterByMonth", cors(), async (req, res) => {
    try {
      const filter = {
        months: {
          $elemMatch: { monthNumber: req.body.monthNumber, year: req.body.year }
        },
        cancel: false
      };
      findByObj(dbs, collections.booking, filter).then(result =>
        res.send(result)
      );
    } catch (error) {
      console.log(error);
    }
  });

  getMonths = (checkIn, checkOut) => {
    let months = [];
    const diffrenceInMonth = moment(checkOut).month() - moment(checkIn).month();

    for (let index = 0; index <= diffrenceInMonth; index++) {
      let obj = correctMonthAndYear(
        moment(checkIn).month() + index,
        moment(checkIn).year()
      );
      months.push(obj);
    }

    return months;
  };

  router.post("/bookings/insert", cors(), async (req, res) => {
    try {
      let booking = req.body;
      booking["balance"] = req.body.amount - req.body.advance;
      booking["months"] = getMonths(req.body.checkIn, req.body.checkOut);
      booking["misc"] = [];
      booking["bookingDate"] = moment();
      insertOne(dbs, collections.booking, booking).then(result =>
        res.status(200).send(result)
      );
    } catch (error) {
      console.log(error);
    }
  });

  router.post("/bookings/update", cors(), async (req, res) => {
    try {
      let booking = req.body;
      if (
        !(
          req.body.cancel ||
          req.body.checkedIn ||
          req.body.checkedOut ||
          req.body.reportGenerated
        )
      ) {
        booking["balance"] = req.body.amount - req.body.advance;
        booking["months"] = getMonths(req.body.checkIn, req.body.checkOut);
        booking["misc"] = [];
      }
      booking["_id"] = new ObjectID(booking._id);
      updateOne(
        dbs,
        collections.booking,
        { _id: booking._id },
        { $set: booking }
      ).then(result => res.status(200).send(result));
    } catch (error) {
      console.log(error);
    }
  });

  // router.get('/getBookingDetails/:id', cors(), async (req, res) => {
  //     try {
  //         const bookingObjectID = new ObjectID(req.params.id);
  //         const bookingObj = await findOnePromise(dbs, collections.bookings, { _id: bookingObjectID });
  //         const personObjectID = new ObjectID(bookingObj.personId);
  //         const personObj = await findOnePromise(dbs, collections.persons, { _id: personObjectID });
  //         bookingObj.bookingId = bookingObj._id;
  //         res.send({ ...bookingObj, ...personObj });
  //     } catch (error) {
  //         console.log(error);
  //     }
  // })
});

module.exports = router;
