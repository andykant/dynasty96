import React from "react";
import Reflux from "reflux";
import Actions from "../actions";
import { Franchise, League } from "../stores";

class Team extends React.Component {
	handleClick(ev) {
	}

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

export default React.createClass({
	mixins: [
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(League, "league")
	],

	selectFranchise: function(ev) {
		var id = ev.currentTarget.getAttribute("data-franchise-id");
		if (id) {
			Actions.franchise(id);
		}
	},

	renderFranchise: function() {
		return <div className="franchise-header">
			<Team {...this.state.franchise} onClick={Actions.clearFranchise} />
		</div>
	},

	render: function() {
		return <section className="franchise">
			{this.state.franchise
				? this.renderFranchise()
				: <div className="franchise-list">
						{this.state.league && this.state.league.map((franchise) => <Team key={franchise.id} {...franchise} onClick={this.selectFranchise} />)}
					</div>
			}
		</section>
	}
});
