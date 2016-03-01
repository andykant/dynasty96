import React from "react";
import ReactDOM from "react-dom";
import Reflux from "reflux";
import { Players, Next } from "../stores";
import Player from "./player";

export default React.createClass({
	mixins: [
		Reflux.connect(Players, "players"),
		Reflux.connect(Next, "next")
	],

	getInitialState: function() {
		return {
			hideGone: JSON.parse(localStorage.getItem("hideGone") || "false"),
			showQB: JSON.parse(localStorage.getItem("showQB") || "true"),
			showRB: JSON.parse(localStorage.getItem("showRB") || "true"),
			showWR: JSON.parse(localStorage.getItem("showWR") || "true"),
			showTE: JSON.parse(localStorage.getItem("showTE") || "true")
		};
	},

	handleHide: function(ev) {
		this.setState({ hideGone: !this.state.hideGone });
		localStorage.setItem("hideGone", JSON.stringify(!this.state.hideGone));
	},

	togglePosition: function(ev) {
		var position = ev.currentTarget.getAttribute("data-position");
		if (position === "All") {
			var checked = ev.currentTarget.checked;
			["showQB","showRB","showWR","showTE"].forEach((position) => {
				localStorage.setItem(position, JSON.stringify(checked));
			});
			this.setState({
				showQB: checked,
				showRB: checked,
				showWR: checked,
				showTE: checked
			});
		}
		else {
			this.setState({ ["show"+position]: !this.state["show"+position] });
			localStorage.setItem("show"+position, JSON.stringify(!this.state["show"+position]));
		}
	},

	componentDidMount: function() {
		// Tweak width of header/footer based on size of scrollbar
		var el = ReactDOM.findDOMNode(this);
		var scrollbarWidth = el.offsetWidth - el.clientWidth;
		ReactDOM.findDOMNode(this.refs.header).style.right = scrollbarWidth + "px";
		ReactDOM.findDOMNode(this.refs.footer).style.right = scrollbarWidth + "px";
	},

	render: function() {
		var next = this.state.next;
		var hideGone = !!this.state.hideGone;
		var myPick = next && next.difference === 0;
		var left = 0;
		var currentOverall = next && next.currentOverall;
		var futurePicks = next && next.futurePicks.slice(0);
		var nextFuturePick = futurePicks && futurePicks.shift();
		var futureDifference = nextFuturePick && currentOverall && (nextFuturePick.overall - currentOverall);
		var showAll = this.state.showQB && this.state.showRB && this.state.showWR && this.state.showTE;
		return <section className="players">
			<Player
				ref="header"
				header={true}
				className="player-header"
				position="P"
				team="T"
				left="#"
				name="Player"
				age="Age"
				adp="MFL ADP"
				dlf_adp="DLF ADP"
				dlf_stddev="DLF StdDev"
			/>
			{this.state.players.map(
				(player, i) => {
					left += player.left;
					if (nextFuturePick && left >= futureDifference) {
						var nextPick = nextFuturePick;
						var isMyPick = myPick;
						myPick = false;
						nextFuturePick = futurePicks.shift() || null;
						futureDifference = nextFuturePick && (nextFuturePick.overall - currentOverall);
						return <div key={"my-pick-" + player.id}>
							<div className={"player-my-pick" + (isMyPick ? " player-my-pick-up" : "")}>{isMyPick && "It's"} My next pick #{parseInt(nextPick.round,10) + "." + nextPick.pick}{isMyPick && "!"} (#{nextPick.overall} overall)</div>
							{(!hideGone || player.left > 0) && this.state["show" + player.position] && 
								<Player key={player.id} {...player} />
							}
						</div>
					}
					else if (!hideGone || player.left > 0) {
						return this.state["show" + player.position] && 
							<Player key={player.id} {...player} />
					}
				}
			)}
			<div className="players-options" ref="footer">
				<span className="players-options-modes">
					<label><input type="checkbox" checked={this.state.hideGone} onChange={this.handleHide} />Hide taken players</label>
				</span>
				<span className="players-options-positions">
					<label><input type="checkbox" checked={showAll} onChange={this.togglePosition} data-position="All" />All</label>
					<label><input type="checkbox" checked={this.state.showQB} onChange={this.togglePosition} data-position="QB" />QB</label>
					<label><input type="checkbox" checked={this.state.showRB} onChange={this.togglePosition} data-position="RB" />RB</label>
					<label><input type="checkbox" checked={this.state.showWR} onChange={this.togglePosition} data-position="WR" />WR</label>
					<label><input type="checkbox" checked={this.state.showTE} onChange={this.togglePosition} data-position="TE" />TE</label>
				</span>
			</div>
		</section>
	}
});
