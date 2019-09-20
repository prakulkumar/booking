import React, { Component } from "react";
import CalendarHeader from "./CalendarHeader";
import CalendarBody from "./CalendarBody";
import Modal from "../../common/Modal/Modal";
import utils from "./../../utils/utils";
import moment from "moment";
import roomService from "../../services/roomService";
import bookingService from "../../services/bookingService";
import "./Calendar.scss";

class Calendar extends Component {
  state = {
    title: "",
    dateObj: {},
    rooms: [],
    bookings: [],
    rows: [],
    showModal: false
  };

  constructor(props) {
    super(props);

    const { currentDate: date } = props.data;
    const dateObj = utils.getDateObj(date);
    const title = this.getTitle(date);

    this.state.title = title;
    this.state.dateObj = dateObj;
  }

  async componentDidMount() {
    const rooms = await roomService.getRooms();
    const rows = this.getTableRows(rooms);

    this.setState({ rooms, rows });

    this.showBookingProcess();
  }

  showBookingProcess = async () => {
    const bookings = await bookingService.getBookings(this.state.dateObj);

    this.setState({ bookings });
    this.showBookings();
  };

  showBookings = () => {
    console.log(99, this.state.bookings);
    const { bookings, dateObj, rooms } = this.state;

    bookings.forEach(booking => {
      let { checkIn, checkOut, months } = booking;
      const color = utils.generateRandomColor();
      if (months.length > 1) {
        const updatedValue = this.getUpdatedValues(booking, dateObj);
        checkIn = updatedValue.checkIn;
        checkOut = updatedValue.checkOut;
      }

      booking.rooms.forEach(roomId => {
        const { roomNumber } = rooms.find(room => room._id === roomId);

        this.setBookingObjByRoom(roomNumber, checkIn, checkOut, booking, color);
      });
    });
  };

  setBookingObjByRoom = (roomNumber, checkIn, checkOut, booking, color) => {
    const rowIndex = this.state.rows.findIndex(
      row => row[0].room.roomNumber === roomNumber
    );
    const dates = utils.daysBetweenDates(checkIn, checkOut);
    this.updateRowObjByDate(dates, rowIndex, booking, color);
  };

  updateRowObjByDate = (dates, rowIndex, booking, color) => {
    const rowsArray = [...this.state.rows];

    dates.forEach(date => {
      const dateNumber = moment(date).date();
      rowsArray[rowIndex] = [...rowsArray[rowIndex]];
      rowsArray[rowIndex][dateNumber] = {
        ...rowsArray[rowIndex][dateNumber],
        booking,
        color
      };
    });

    this.setState({ rows: rowsArray });
  };

  getTableHeaders = () => {
    let tableHeaders = new Array(this.state.dateObj.days + 1).fill({});
    tableHeaders = tableHeaders.map((value, index) => {
      if (index !== 0) return { date: index < 10 ? `0${index}` : `${index}` };
      else return { date: "" };
    });

    return tableHeaders;
  };

  getTableRows = rooms => {
    const { dateObj } = this.state;

    let rows = new Array(rooms.length).fill();
    rows.forEach((row, index) => {
      rows[index] = new Array(dateObj.days + 1).fill({
        room: { ...rooms[index] },
        handleShowModal: this.handleShowModal
      });
      rows[index][0] = { room: { ...rooms[index] }, show: true };
    });

    return rows;
  };

  getTitle = date =>
    `${moment(date)
      .format("MMMM")
      .toUpperCase()} ${moment(date).year()}`;

  getUpdatedValues = (booking, dateObj) => {
    let { checkIn, checkOut, months } = booking;
    const { month, year, days } = dateObj;
    const index = months.findIndex(
      month => month.monthNumber === dateObj.month
    );

    if (index === 0) {
      checkIn = utils.getDate(checkIn);
      checkOut = utils.getDate(`${month + 1}/${days}/${year}`);
    } else if (index === months.length - 1) {
      checkIn = utils.getDate(`${month + 1}/1/${year}`);
      checkOut = utils.getDate(checkOut);
    } else {
      checkIn = utils.getDate(`${month + 1}/1/${year}`);
      checkOut = utils.getDate(`${month + 1}/${days}/${year}`);
    }

    return { checkIn, checkOut };
  };

  handleChange = value => {
    const { dateObj: prevDateObj } = this.state;
    const prevDate = new Date(prevDateObj.year, prevDateObj.month);
    const newDate = moment(prevDate).add(value, "M");
    const dateObj = utils.getDateObj(newDate);
    const title = this.getTitle(newDate);

    this.setState({ title, dateObj });
  };

  handleShowModal = booking => {
    console.log({ booking }, this.state.showModal);
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { title, dateObj, rows, showModal } = this.state;

    return (
      <div className="calendar__container">
        <CalendarHeader
          title={title}
          onChange={this.handleChange}
          month={dateObj.month}
        />
        <CalendarBody tableHeaders={this.getTableHeaders()} tableRows={rows} />
        {showModal && (
          <Modal
            openModal={this.state.showModal}
            onCloseModal={this.handleCloseModal}
            size="lg"
          />
        )}
      </div>
    );
  }
}

export default Calendar;