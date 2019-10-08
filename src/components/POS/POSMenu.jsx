import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { Menu, MenuItem, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  btnPOS: {
    marginRight: 20
  }
}));

const POSMenu = ({ showPOSDialog }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  //const [showDialog, toggleDialog] = useState(false);

  const handleOpenPOSMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePOSMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenPOSDailog = title => {
    showPOSDialog(title);
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button
        aria-controls="pos-menu"
        aria-haspopup="true"
        className={classes.btnPOS}
        color="inherit"
        onClick={event => handleOpenPOSMenu(event)}
      >
        POS
      </Button>
      <Menu
        id="pos-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClosePOSMenu}
      >
        <MenuItem onClick={() => handleOpenPOSDailog("Food")}>Food</MenuItem>
        <MenuItem onClick={() => handleOpenPOSDailog("Transport")}>
          Transport
        </MenuItem>
        <MenuItem onClick={() => handleOpenPOSDailog("Laundary")}>
          Laundary
        </MenuItem>
        <MenuItem onClick={() => handleOpenPOSDailog("Miscellaneous")}>
          Miscellaneous
        </MenuItem>
        <MenuItem onClick={() => handleOpenPOSDailog("Remarks")}>
          Remarks
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
};

export default POSMenu;
