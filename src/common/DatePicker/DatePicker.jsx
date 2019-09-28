import "moment";
import React from "react";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

import styles from "./DatePickerStyle";
import { ArrowRightRounded } from "@material-ui/icons";

const CustomDatePicker = ({ label, onChange, error, ...props }) => {
  const classes = styles(props);

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        error={error && true}
        className={classes.root}
        disableToolbar
        variant="inline"
        format="DD/MM/YYYY"
        margin="normal"
        id={label}
        label={label}
        onChange={event => onChange(event, props.id)}
        helperText={error}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};

export default CustomDatePicker;
