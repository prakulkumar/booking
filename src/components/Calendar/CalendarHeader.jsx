import moment from "moment";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import "./CalendarHeader.scss";

const useStyles = makeStyles(theme => ({
  root: {},
  appBar: {
    backgroundColor: "#616161"
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between"
  }
}));

const CalendarHeader = ({ title, onChange, month }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense" className={classes.toolbar}>
          <IconButton
            disabled={moment().month() === month}
            edge="start"
            color="inherit"
            onClick={() => onChange(-1)}
          >
            <ArrowBackIosRoundedIcon />
          </IconButton>
          <Typography variant="h6" color="inherit">
            {title}
          </Typography>
          <IconButton edge="start" color="inherit" onClick={() => onChange(1)}>
            <ArrowForwardIosRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default CalendarHeader;
