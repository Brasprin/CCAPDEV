const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const {
  DateModel,
  LaboratoryNumber,
  TimeSlot,
  SeatStatus,
  userProfileModel,
} = require("../models/laboratorySchema");

router.get("/userProfile", async (req, res) => {
  try {
    const email = req.session.user.email;

    const userProfile = await userProfileModel.findOne({ email });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userData = {
      email: userProfile.email,
      name: userProfile.username,
      description: userProfile.description,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getRoomSeatDateTime", async (req, res) => {
  const email = req.session.user.email;
  const all = req.query.all;

  try {
    let bookingsQuery;

    console.log(all);
    if (all === "true") {
      bookingsQuery = userProfileModel
        .find()
        .select("username email")
        .populate({
          path: "bookings",
          populate: {
            path: "timeSlot",
            populate: {
              path: "laboratory",
              populate: {
                path: "date",
              },
            },
          },
        });
    } else {
      bookingsQuery = userProfileModel.findOne({ email }).populate({
        path: "bookings",
        populate: {
          path: "timeSlot",
          populate: {
            path: "laboratory",
            populate: {
              path: "date",
            },
          },
        },
      });
    }

    const result = await bookingsQuery;

    if (!result) {
      return res.status(404).json({ error: "No users found" });
    }

    // Process bookings
    const processBookings = (userProfile) => {
      if (!userProfile || !userProfile.bookings) {
        console.warn(
          `No bookings found for user: ${
            userProfile ? userProfile.email : "unknown"
          }`
        );
        return [];
      }

      return userProfile.bookings
        .map((booking) => {
          return {
            date: booking.timeSlot.laboratory.date.date,
            laboratoryNumber: booking.timeSlot.laboratory.laboratoryNumber,
            timeSlot: booking.timeSlot.timeSlot,
            seatNumber: booking.seatNumber,
            status: booking.status,
            bookerName: booking.info?.bookerName || userProfile.username,
            bookerEmail: booking.info?.bookerEmail || userProfile.email,
            bookingDate: booking.info?.bookingDate,
            requestTime: booking.info?.requestTime,
          };
        })
        .filter((booking) => booking !== null);
    };

    let bookings;
    if (all === "true") {
      bookings = result.flatMap(processBookings);
    } else {
      bookings = processBookings(result);
    }

    // Sort bookings
    bookings.sort((a, b) => {
      const dateComparison = new Date(b.date) - new Date(a.date);
      if (dateComparison !== 0) return dateComparison;

      const timeSlotComparison = b.timeSlot.localeCompare(a.timeSlot);
      if (timeSlotComparison !== 0) return timeSlotComparison;

      const roomNumberComparison = a.laboratoryNumber - b.laboratoryNumber;
      if (roomNumberComparison !== 0) return roomNumberComparison;

      return a.seatNumber - b.seatNumber;
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error retrieving user bookings:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/cancelbooking", async (req, res) => {
  const { seatNumber, labNumber, bookingDate, timeslot } = req.query;
  const bookerEmail = req.session.user.email;

  try {
    const queryDate = new Date(bookingDate + "T00:00:00Z");
    const nextDay = new Date(queryDate);
    nextDay.setUTCDate(queryDate.getUTCDate() + 1);

    const dateDoc = await DateModel.findOne({
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    });

    if (!dateDoc) {
      return res.status(404).json({ message: "Date not found" });
    }

    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      match: { timeSlot: timeslot },
      populate: {
        path: "seatStatuses",
        match: { seatNumber: seatNumber },
      },
    });

    if (!laboratory) {
      return res.status(404).json({ message: "Laboratory not found" });
    }

    // Find the specific time slot and seat status
    const timeSlot = laboratory.timeSlots.find(
      (slot) => slot.timeSlot === timeslot
    );

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    const seatStatus = timeSlot.seatStatuses.find(
      (status) => status.seatNumber === seatNumber && status.status === "Booked"
    );

    if (!seatStatus) {
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled" });
    }

    // Update seat status to available and clear booking info
    seatStatus.status = "Available";
    seatStatus.info = {};
    const cancelledSeatStatus = await seatStatus.save();

    // Remove reference from user's profile
    await userProfileModel.updateOne(
      { email: bookerEmail },
      { $pull: { bookings: seatStatus._id } }
    );

    res
      .status(200)
      .json({ message: "Booking cancelled", seatStatus: cancelledSeatStatus });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
});

module.exports = router;
