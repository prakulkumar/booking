import React, { Component } from 'react';
import BookingForm from './BookingForm';
import BookingDetails from './BookingDetails';
import Header from './Header';

import axios from 'axios';
const roomTypes = ['AC', 'Non AC', 'Deluxe', 'Suite', 'Dormitory'];
class Booking extends Component {
    state = {
        validated: false,
        hotelBookingForm: {
            firstName: '',
            lastName: '',
            address: '',
            checkIn: '',
            checkOut: '',
            adults: '',
            children: 0,
            contactNumber: '',
            rooms: [],
            amount: '',
            advance: ''
        },
        cancel: false,
        checkedIn: false,
        checkedOut: false,
        availableRooms: [],
        formIsValid: true,
        isEdit: false,
        bookingId: null,
        personId: null,
        disable: false,
        misc: '',
        balance: '',
        status: ''
    }

    componentDidMount() {
        console.log(this.props);
        let disable = false;
        if (this.props.status === 'viewBooking') {
            let data = this.props.detailsForForm.booking;
            let form = {
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                checkIn: new Date(data.checkIn),
                checkOut: new Date(data.checkOut),
                adults: data.adults,
                children: data.children,
                contactNumber: data.contactNumber,
                rooms: data.rooms,
                amount: data.amount,
                advance: data.advance
            }

            this.setState({
                hotelBookingForm: form,
                disable: true,
                bookingId: data._id,
                misc: data.misc,
                balance: data.balance,
                cancel: data.cancel,
                checkedIn: data.checkedIn,
                checkedOut: data.checkedOut,
                status: this.props.status
            });

            this.getAvailableRooms(new Date(data.checkIn), new Date(data.checkOut));
        } else {
            let updatedForm = { ...this.state.hotelBookingForm };
            updatedForm['checkIn'] = new Date();
            this.setState({
                hotelBookingForm: updatedForm,
                status: this.props.status
            });
        }

        this.setState({ checkedOut: true });
    }

    inputChangedHandler = (event) => {
        let updatedForm = { ...this.state.hotelBookingForm };
        if (event.isDate) {
            updatedForm[event.name] = event.event;
            this.setState({ hotelBookingForm: updatedForm });
            if (event.name === 'checkIn') {
                updatedForm['checkOut'] = '';
                updatedForm.rooms = [];
                this.setState({ hotelBookingForm: updatedForm });
            }
            if (event.name === 'checkOut') {
                updatedForm.rooms = [];
                this.setState({ hotelBookingForm: updatedForm });
                this.getAvailableRooms(this.state.hotelBookingForm.checkIn, event.event);
            }
        }
        else {
            updatedForm[event.target.name] = event.target.name === 'firstName' || event.target.name === 'lastName' ? event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1) : event.target.value;
            this.setState({ hotelBookingForm: updatedForm });
        }
    }

    roomDetailsChangedHandler = (event, name, index) => {
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms];
        if (event.target.name === "roomType") {
            updatedRooms[index] = { 'roomType': event.target.value };
        }
        if (event.target.name === "roomNumber") {
            updatedRooms[index] = this.state.availableRooms.filter(room => room.roomNumber === event.target.value)[0];
        }
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    // get the available rooms between checkin date and checkout date
    getAvailableRooms = (checkIn, checkOut) => {
        axios.post('/rooms/available', { checkIn, checkOut, bookingId: this.state.bookingId })
            .then(res => {
                console.log('new api', res.data);
                let availableRooms = res.data;
                let rooms = this.props.rooms.filter((room) => {
                    return this.state.hotelBookingForm.rooms.indexOf(room._id) >= 0;
                });
                let updatedForm = { ...this.state.hotelBookingForm };
                updatedForm.rooms = rooms;
                availableRooms = availableRooms.concat(rooms);
                this.setState({ availableRooms, hotelBookingForm: updatedForm });
                if (this.state.hotelBookingForm.rooms.length === 0) { this.setDefaultRoom() };
            }).catch(error => console.log(error));
    }

    setDefaultRoom = () => {
        let tempObj;
        let room = this.state.availableRooms.filter(room => room._id === this.props.detailsForForm.roomId);
        room.length > 0 ? tempObj = room[0] : tempObj = this.state.availableRooms[0];
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms];
        updatedRooms.push(tempObj);
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    addRoom = () => {
        let updatedForm = { ...this.state.hotelBookingForm };
        let updatedRooms = [...updatedForm.rooms];
        updatedRooms.push({});
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    deleteRoom = (index) => {
        let updatedForm = { ...this.state.hotelBookingForm };
        let rooms = [...updatedForm.rooms]
        let updatedRooms = rooms.filter((room, i) => i !== index);
        updatedForm.rooms = updatedRooms;
        this.setState({ hotelBookingForm: updatedForm });
    }

    closeModalHandler = () => {
        this.setState({ validated: false });
        this.clearForm();
        this.props.onClose();
    }

    clearForm = () => {
        let updatedForm = { ...this.state.hotelBookingForm };
        for (let element in updatedForm) {
            let updatedFormElement = { ...updatedForm[element] }
            if (element === 'rooms') {
                updatedFormElement = [];
            } else {
                updatedFormElement = '';
            }
            updatedForm[element] = updatedFormElement;
        }
        this.setState({ hotelBookingForm: updatedForm });
    }

    hotelBookedHandler = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        let bookingData = {};
        let url = '';
        if (form.checkValidity()) {
            for (let element in this.state.hotelBookingForm) {
                if (element === 'rooms') {
                    let rooms = this.state.hotelBookingForm[element].map(room => room._id);
                    bookingData[element] = rooms;
                }
                else bookingData[element] = this.state.hotelBookingForm[element];
            }
            bookingData['cancel'] = this.state.cancel;
            bookingData['checkedIn'] = this.state.checkedIn;
            bookingData['checkedOut'] = this.state.checkedOut;
            delete bookingData.step;
            if (this.state.isEdit && this.state.disable) {
                console.log('update');
                url = '/bookings/update';
                bookingData['_id'] = this.state.bookingId;
            } else {
                url = '/bookings/insert';
                notification = notifications.SUCCESS;
                message = messages.BOOKING_SUCCESS
            }
            console.log('booking data : ', bookingData);
            axios.post(url, bookingData)
                .then(res => {
                    console.log(res.data);
                    if (res.status === 200) {
                        this.props.notify(notification, message);
                        this.props.handleBookings();
                    }
                }).catch(error => {
                    this.props.notify(notifications.ERROR, messages.BOOKING_ERROR);
                    console.log(error);
                });
            this.props.onClose();
        }
        this.setState({ validated: true });
    }

    edit = () => {
        this.setState({ isEdit: true, status: 'editBooking' });
    }

    cancel = () => {
        this.setState({ cancel: true });
        let data = {
            'cancel': true,
            '_id': this.state.bookingId
        }
        axios.post('/bookings/update', data)
            .then(res => {
                console.log(res.data);
                if (res.status === 200) this.props.handleBookings();
            }).catch(error => {
                this.props.notify(notifications.ERROR, messages.BOOKING_ERROR);
                console.log(error);
            });
        this.props.onClose();
    }

    checkIn = () => {
        this.setState({ checkedIn: true });
        let data = {
            'checkedIn': true,
            '_id': this.state.bookingId
        }
        axios.post('/bookings/update', data)
            .then(res => {
                if (res.status === 200) this.props.handleBookings();
            }).catch(error => {
                this.props.notify(notifications.ERROR, messages.BOOKING_ERROR);
                console.log(error);
            });
        this.props.onClose();
    }

    checkOut = () => {
        this.setState({ checkedOut: true });
        let data = {
            'checkedOut': true,
            '_id': this.state.bookingId
        }
        axios.post('/bookings/update', data)
            .then(res => {
                if (res.status === 200) this.props.handleBookings();
            }).catch(error => {
                this.props.notify(notifications.ERROR, messages.BOOKING_ERROR);
                console.log(error);
            });
        this.props.onClose();
    }

    generateReport = (payment) => {
        this.setState({ hotelBookingForm: { ...this.state.hotelBookingForm, ...payment } });

        setTimeout(() => {
            console.log(this.state.hotelBookingForm);
        }, 2000);
    }

    render() {
        return (
            <React.Fragment>
                {this.state.hotelBookingForm.checkIn !== '' && !this.state.checkedOut ? (
                    <div>
                        <Header
                            edit={this.edit}
                            cancel={this.cancel}
                            checkIn={this.checkIn}
                            checkOut={this.checkOut}
                            checkedIn={this.state.checkedIn}
                            checkOutDate={this.state.hotelBookingForm.checkOut}
                        />
                        <BookingForm
                            hotelBookingForm={this.state.hotelBookingForm}
                            onChanged={(event) => this.inputChangedHandler(event)}
                            onRoomChanged={(event, name, index) => { this.roomDetailsChangedHandler(event, name, index) }}
                            roomTypes={roomTypes}
                            availableRooms={this.state.availableRooms}
                            addRoom={this.addRoom}
                            deleteRoom={this.deleteRoom}
                            onBooked={(event) => this.hotelBookedHandler(event)}
                            validated={this.state.validated}
                            onClose={this.props.onClose}
                        />
                    </div>
                ) :
                    <BookingDetails booking={this.state.hotelBookingForm} generateReport={this.generateReport}></BookingDetails>}
            </React.Fragment>
        );
    }
}

export default Booking;