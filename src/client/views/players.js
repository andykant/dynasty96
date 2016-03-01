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
			hideGone: JSON.parse(localStorage.getItem("hideGone") || "false")
		};
	},

	handleHide: function(ev) {
		this.setState({ hideGone: !this.state.hideGone });
		localStorage.setItem("hideGone", JSON.stringify(!this.state.hideGone));
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
						nextFuturePick = futurePicks.shift() || null;
						futureDifference = nextFuturePick && (nextFuturePick.overall - currentOverall);
						return <div key={"my-pick-" + player.id}>
							<div className={"player-my-pick" + (myPick ? " player-my-pick-up" : "")}>{myPick && "It's"} My next pick #{parseInt(nextPick.round,10) + "." + nextPick.pick}{myPick && "!"} (#{nextPick.overall} overall)</div>
							{(!hideGone || player.left > 0) && <Player key={player.id} {...player} />}
						</div>
					}
					else if (!hideGone || player.left > 0) {
						return <Player key={player.id} {...player} />
					}
				}
			)}
			<div className="players-options" ref="footer">
				<label><input type="checkbox" checked={this.state.hideGone} onChange={this.handleHide} />hide taken players</label>
			</div>
		</section>
	}
});
