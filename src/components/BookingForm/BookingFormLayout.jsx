import React, { Component } from "react";
import utils from "../../utils/utils";

import Card from "../../common/Card/Card";
import BookingForm from "../BookingForm/BookingForm";
import BookingFormHeader from "./BookingFormHeader";

import FormUtils from "../../utils/formUtils";
import constants from "../../utils/constants";
import schemas from "../../utils/joiUtils";
import "./BookingFormLayout.scss";
import roomService from "../../services/roomService";
import bookingService from "../../services/bookingService";

const schema = schemas.bookingFormSchema;
const { success, error } = constants.snackbarVariants;
const roomTypes = [
  { label: "AC", value: "AC" },
  { label: "Non AC", value: "Non AC" },
  { label: "Deluxe", value: "Deluxe" },
  { label: "Suite", value: "Suite" },
  { label: "Dormitory", value: "Dormitory" }
];

class BookingFormLayout extends Component {
  state = {
    data: {
      hotelName: "Hotel Black Rose",
      hotelAddress: "#234 street, Bangalore",
      firstName: "",
      lastName: "",
      address: "",
      checkIn: utils.getDate(),
      checkOut: utils.getDate(),
      checkedInTime: "",
      checkedOutTime: "",
      adults: "",
      children: 0,
      contactNumber: "",
      rooms: [],
      roomCharges: "",
      advance: "",
      bookingDate: null,
      status: {
        cancel: false,
        checkedIn: false,
        checkedOut: false
      }
    },
    errors: {},
    availableRooms: [],
    isEdit: false,
    shouldDisable: false
  };

  async componentDidMount() {
    const { pathname } = this.props.location;
    if (this.props.selectedRoom !== null) {
      if (pathname === "/booking/viewBooking") this.setViewBookingData();
      else if (pathname === "/booking/newBooking") this.setNewBookingData();
    } else this.props.history.replace("/");
  }

  setViewBookingData = () => {
    const { selectedBooking } = this.props;
    const availableRooms = this.props.selectedBooking.rooms;
    const booking = {
      ...selectedBooking,
      checkIn: selectedBooking.checkIn,
      checkOut: selectedBooking.checkOut
    };

    this.setState({
      data: booking,
      disable: true,
      availableRooms,
      shouldDisable: !this.state.isEdit
    });
  };

  setNewBookingData = async () => {
    const { selectedRoom, selectedDate } = this.props;
    const data = { ...this.state.data };
    const { roomNumber, roomType, _id } = selectedRoom;
    const room = { roomNumber, roomType, _id };
    data.rooms.push(room);
    data.checkIn = selectedDate;
    data.checkOut = selectedDate;

    const availableRooms = await this.getAvailableRooms(
      data.checkIn,
      data.checkOut
    );
    availableRooms && console.log(availableRooms.length);
    this.setState({ data, availableRooms });
  };

  getAvailableRooms = async (checkIn, checkOut, bookingId) => {
    return await roomService.getAvailableRooms(checkIn, checkOut, bookingId);
  };

  getUpdatedRooms = (availableRooms, rooms) => {
    const roomsIndex = this.getIndexesToRemoveRoomsFromState(
      availableRooms,
      rooms
    );
    roomsIndex.forEach(index => {
      rooms[index] = availableRooms.find(
        r => r.roomType === rooms[index].roomType
      );
    });

    return rooms;
  };

  getIndexesToRemoveRoomsFromState = (availableRooms, rooms) => {
    const roomsIndex = [];
    const r = rooms.filter(room => {
      let a = availableRooms.findIndex(
        availableRoom => availableRoom.roomNumber === room.roomNumber
      );
      return a === -1 ? room : null;
    });

    r.forEach(currentRoom => {
      const index = rooms.findIndex(
        room => room.roomNumber === currentRoom.roomNumber
      );
      roomsIndex.push(index);
    });

    return roomsIndex;
  };

  createBooking = async bookingData => {
    const { status } = await bookingService.addBooking(bookingData);
    if (status === 200) this.openSnackBar("Booking Successfull", success, "/");
    else this.openSnackBar("Error Occurred", error);
  };

  updateBooking = async (
    bookingData,
    message = "Booking Updated Successfully"
  ) => {
    const { status } = await bookingService.updateBooking(bookingData);
    if (status === 200) this.openSnackBar(message, success, "/");
    else this.openSnackBar("Error Occurred", error);
  };

  checkForErrors = () => {
    const errors = FormUtils.validate(this.state.data, schema);
    this.setState({ errors });
    return Object.keys(errors).length;
  };

  openSnackBar = (message, variant, redirectTo) => {
    const snakbarObj = { open: true, message, variant };
    this.props.onSnackbarEvent(snakbarObj);
    redirectTo && this.props.history.push(redirectTo);
  };

  handleInputChange = ({ currentTarget: input }) => {
    const { data, errors } = this.state;
    const updatedState = FormUtils.handleInputChange(
      input,
      data,
      errors,
      schema
    );
    this.setState({ data: updatedState.data, errors: updatedState.errors });
  };

  handleDatePickerChange = async (event, id) => {
    const data = { ...this.state.data };
    let rooms = [...data.rooms];
    data[id] = utils.getDate(event);
    if (id === "checkIn") data["checkOut"] = data[id];

    const availableRooms = await this.getAvailableRooms(
      data.checkIn,
      data.checkOut,
      data._id
    );

    data.rooms = this.getUpdatedRooms(availableRooms, rooms);
    this.setState({ data, availableRooms });
  };

  handleSelectChange = (event, index) => {
    let errors = { ...this.state.errors };
    if (errors.rooms)
      errors.rooms = errors.rooms.filter(error => error.index !== index);

    const { name, value } = event.target;
    const data = { ...this.state.data };
    const rooms = [...data.rooms];
    let room = {};

    if (name === "roomType")
      room = this.state.availableRooms.find(room => room.roomType === value);
    else if (name === "roomNumber")
      room = this.state.availableRooms.find(room => room.roomNumber === value);

    rooms[index] = {
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      _id: room._id
    };
    data.rooms = rooms;
    this.setState({ data, errors });
  };

  handleFormSubmit = event => {
    event.preventDefault();
    const data = this.state.data;
    const errors = this.checkForErrors();
    if (errors) return;

    let bookingData = {
      ...data,
      balance: data.roomCharges - data.advance
    };
    if (!this.state.isEdit) {
      bookingData["bookingDate"] = utils.getDate();
      this.createBooking(bookingData);
    } else {
      this.updateBooking(bookingData);
    }
  };

  handleAddRoom = () => {
    const data = { ...this.state.data };
    const rooms = [...data.rooms];
    rooms.push({
      roomNumber: "",
      roomType: "",
      _id: ""
    });
    data.rooms = rooms;

    this.setState({ data });
  };

  handleDeleteRoom = index => {
    const data = { ...this.state.data };
    let rooms = [...data.rooms];

    rooms = rooms.filter((room, i) => i !== index);
    data.rooms = rooms;

    this.setState({ data });
  };

  handleEdit = () => {
    this.setState({ isEdit: true, shouldDisable: false });
  };

  handleBack = () => {
    this.props.history.push("/");
  };

  handleEdit = () => {
    this.setState({ isEdit: true, shouldDisable: false });
  };

  handleCancel = () => {
    const data = { ...this.state.data };
    data.status = { ...data.status, cancel: true };
    this.setState({ data });
    this.updateBooking(data, "Booking Cancelled Successfully");
  };

  handleCheckIn = () => {
    const data = { ...this.state.data };
    data.checkedInTime = utils.getTime();
    data.status = { ...data.status, checkedIn: true };
    this.setState({ data });
    this.updateBooking(data, "Checked In Successfully");
  };

  handleCheckOut = () => {
    this.props.onCheckOutRedirect(this.state.data);
  };

  render() {
    const { data, availableRooms, errors, shouldDisable } = this.state;

    const cardContent = (
      <BookingForm
        onDatePickerChange={this.handleDatePickerChange}
        onInputChange={this.handleInputChange}
        onSelectChange={this.handleSelectChange}
        onFormSubmit={this.handleFormSubmit}
        onAddRoom={this.handleAddRoom}
        onDeleteRoom={this.handleDeleteRoom}
        data={data}
        availableRooms={availableRooms}
        errors={errors}
        options={roomTypes}
        shouldDisable={shouldDisable}
        onBack={this.handleBack}
      />
    );

    return (
      <div className="cardContainer">
        <Card
          header={
            <BookingFormHeader
              status={data.status}
              checkIn={data.checkIn}
              checkOut={data.checkOut}
              onEdit={this.handleEdit}
              onCancel={this.handleCancel}
              onCheckIn={this.handleCheckIn}
              onCheckOut={this.handleCheckOut}
            />
          }
          content={cardContent}
          maxWidth={700}
          margin="40px auto"
        />
      </div>
    );
  }
}

export default BookingFormLayout;
