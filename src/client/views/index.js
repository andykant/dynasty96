import React from "react";
import Franchise from "./franchise";
import Players from "./players";

export default class Index extends React.Component {  
  render() {
    return <div className="app">
    	<Franchise />
    	<Players />
    </div>
  }
}
