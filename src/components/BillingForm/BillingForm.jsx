import React from "react";
import { makeStyles } from "@material-ui/core";
import { Typography, Divider } from "@material-ui/core";
import Input from "../../common/Input/Input";
import Checkbox from "./../../common/Checkbox/Checkbox";
// import Dialog from "../../common/Dialog/Dialog";
// import RadioGroup from "./../../common/RadioGroup/RadioGroup";

const useStyles = makeStyles(theme => ({
  formGroup: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: { width: "50%" }
}));

const BillingForm = () => {
  const classes = useStyles();

  // ------------------------RadioGroup-----------
  // const [value, setValue] = React.useState();

  // const handleChange = event => {
  //   setValue(event.target.value);
  // };

  // const radioButtons = [
  //   { value: "withTax", label: "With Tax" },
  //   { value: "withOutTax", label: "WithOut Tax" }
  // ];

  // ------------------------DatePicker-----------
  // const [selectedDate, setSelectedDate] = React.useState(new Date());

  // const handleDateChange = date => {
  //   setSelectedDate(date);
  // };

  // ------------------------Dialog-----------
  // const [open, setOpen] = React.useState(true);

  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  const renderInputItems = (label, value, inputId) => {
    return (
      <div className={classes.formGroup}>
        <Typography display={"block"} nowrap={"true"}>
          {label}
        </Typography>
        <Typography>:</Typography>
        <Input disabled width="50%" id={inputId} type="text" value={value} />
      </div>
    );
  };

  const renderPaymentMethods = (label, value, inputId, placeholder) => {
    return (
      <div className={classes.formGroup}>
        <Checkbox label={label} />
        <Input
          width="50%"
          id={inputId}
          type="text"
          value={value}
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <form>
      {/* <DatePicker date={selectedDate} handleDateChange={handleDateChange} /> */}
      {/* <RadioGroup
        ariaLabel={"taxInfo"}
        name={"tax"}
        value={value}
        handleChange={handleChange}
        radioButtons={radioButtons}
      /> */}
      {/* <Dialog open={open} onClose={handleClose} /> */}
      {renderInputItems("Room Charges", 3000, "roomCharges")}
      {renderInputItems("Advance", 1000, "advance")}
      {renderInputItems("Misllaneous", 2000, "misllaneous")}
      {renderInputItems("Balance", 4000, "balance")}
      <Divider />
      {renderPaymentMethods("Cash Payment", "", "cash", "Amount")}
      {renderPaymentMethods("Card Payment", "", "card", "Amount")}
      {renderPaymentMethods("Wallet Payment", "", "wallet", "Amount")}
    </form>
  );
};

export default BillingForm;
