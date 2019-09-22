import React from "react";
import moment from "moment";
import colorConverter from "hex-to-rgba";
import { getShortName } from "./../../utils/utils";
import { makeStyles, Table, Paper, ButtonBase } from "@material-ui/core";
import { TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import Popover from "../../common/Popover/Popover";
import "./CalendarBody.scss";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "80%",
    overflowY: "auto"
  },
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white
  },
  tableBody: {
    overflow: "auto"
  },
  table: {
    minWidth: 700
  },
  tableWrapper: {
    maxHeight: 407,
    overflow: "auto"
  },
  div: {
    padding: 10,
    width: "100%",
    height: "100%",
    fontWeight: 600
  },
  buttonDisable: {
    backgroundColor: "#d7d7d7",
    color: "#9f9f9f"
  },
  buttonBase: {
    width: "100%",
    height: "100%"
  },
  tableCell: {
    padding: 0,
    textAlign: "center",
    borderRight: "1px solid #9e9e9e",
    borderBottom: "1px solid #9e9e9e",
    minWidth: 40,
    "&:last-child": {
      padding: 0
    }
  }
}));

const CalendarBody = ({ tableHeaders, tableRows }) => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Paper className={`${classes.root} hideSrollbar`}>
        <Table className={classes.root} stickyHeader>
          <TableHead>
            <TableRow>{renderTableHead(tableHeaders, classes)}</TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {renderTableRows(tableRows, classes)}
          </TableBody>
        </Table>
      </Paper>
    </React.Fragment>
  );
};

const renderTableHead = (tableHeaders, classes) => {
  return (
    <React.Fragment>
      {tableHeaders.map(value => (
        <TableCell className={classes.tableCell} key={`date_${value.date}`}>
          <ButtonBase className={classes.buttonBase}>
            <div className={classes.div}>{value.date}</div>
          </ButtonBase>
        </TableCell>
      ))}
    </React.Fragment>
  );
};

const renderTableRows = (tableRows, classes) => {
  return (
    <React.Fragment>
      {tableRows.map((row, index) => (
        <TableRow key={`row_${index}`}>
          {renderTableColumns(row, classes)}
        </TableRow>
      ))}
    </React.Fragment>
  );
};

const renderTableColumns = (row, classes) => {
  return (
    <React.Fragment>
      {row.map((column, index) =>
        getStandardCell(getArgObj(column, index, classes))
      )}
    </React.Fragment>
  );
};

const getStandardCell = (...argument) => {
  const arg = argument[0];
  const customStyle = {
    color: arg.color,
    pointerEvents: "",
    backgroundColor: arg.color && colorConverter(arg.color, 0.05)
  };
  const buttonBasedStyle = {
    pointerEvents: arg.booking && "all",
    cursor: "pointer"
  };

  return (
    <TableCell
      key={arg.key}
      style={customStyle}
      className={arg.classes.tableCell}
      onClick={() => arg.handleShowModal(arg.booking)}
    >
      <ButtonBase
        disabled={arg.disable}
        style={buttonBasedStyle}
        className={
          arg.disable
            ? `${arg.classes.buttonBase} ${arg.classes.buttonDisable}`
            : arg.classes.buttonBase
        }
      >
        <div className={arg.classes.div}>
          <Popover
            content={arg.value}
            popoverContent={
              arg.booking && `${arg.booking.firstName} ${arg.booking.lastName}`
            }
          />
        </div>
      </ButtonBase>
    </TableCell>
  );
};

const getArgObj = (column, index, classes) => {
  let { show, room, booking, handleShowModal, color } = column;
  const currentDate = moment().date();
  handleShowModal =
    index >= currentDate || booking ? handleShowModal : () => {};
  const name = booking && getShortName(booking.firstName, booking.lastName);
  const key = `column_${index}`;
  const disable = index < currentDate ? true : false;

  if (show) return { key, value: room.roomNumber, classes };
  else
    return {
      key,
      value: name,
      disable,
      handleShowModal,
      color,
      booking,
      classes
    };
};

export default CalendarBody;
