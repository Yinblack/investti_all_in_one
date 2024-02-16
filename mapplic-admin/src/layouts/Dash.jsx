import React from "react";
import { Outlet } from "react-router-dom";

const Dash = () => (
  <React.Fragment>
    <div id="main">
      <Outlet />
    </div>
  </React.Fragment>
);

export default Dash;