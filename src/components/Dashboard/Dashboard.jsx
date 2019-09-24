import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";

import Calendar from "./../Calendar/Calendar";
import Navbar from "./../Navbar/Navbar";
import BookingFormLayout from "../BookingFormLayout/BookingFormLayout";

class Dashboard extends Component {
  state = {
    currentDate: new Date(),
    isRefresh: false
  };

  handleRefresh = () => {
    // this.setState({ isRefresh: !this.state.isRefresh });
  };

  render() {
    const calendarData = this.state;

    return (
      <React.Fragment>
        <Navbar onRefresh={this.handleRefresh} />
        <Switch>
          <Route
            path="/"
            render={() => (
              <Calendar data={calendarData} onRefresh={this.handleRefresh} />
            )}
          />
          <Route path="/booking" component={BookingFormLayout} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default Dashboard;
