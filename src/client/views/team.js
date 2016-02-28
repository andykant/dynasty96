import React from "react";

export default class Team extends React.Component {
  render() {
  	var franchise = this.props;
    return <div className="franchise-main" data-franchise-id={franchise.id} onClick={this.props.onClick}>
    	{franchise.icon
				? <img title={franchise.name} className="franchise-icon" src={franchise.icon} />
				: <span className="franchise-name">{franchise.name}</span>
			}
		</div>
  }
}
