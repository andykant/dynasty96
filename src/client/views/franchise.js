import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import Reflux from "reflux";
import Actions from "../actions";
import { Franchise, League, DraftResults, Rosters, Players, Next } from "../stores";
import Team from "./team";
import Player from "./player";
import Depth from "./depth";

export default React.createClass({
	mixins: [
		Reflux.connect(Franchise, "franchise"),
		Reflux.connect(League, "league"),
		Reflux.connect(DraftResults, "draftResults"),
		Reflux.connect(Rosters, "rosters"),
		Reflux.connect(Next, "next")
	],

	getInitialState: function() {
		return {
			showLog: false,
			showDepth: false
		};
	},

	toggleDepth: function(ev) {
		this.setState({ showDepth: !this.state.showDepth });
	},

	toggleLog: function(ev) {
		this.setState({ showLog: !this.state.showLog });
	},

	selectFranchise: function(ev) {
		var id = ev.currentTarget.getAttribute("data-franchise-id");
		if (id) {
			Actions.franchise(id);
		}
	},

	componentDidUpdate: function() {
		// Tweak width of header/footer based on size of scrollbar
		if (this.refs.header && this.refs.footer) {
			var el = ReactDOM.findDOMNode(this);
			ReactDOM.findDOMNode(this.refs.header).style.width = el.clientWidth + "px";
			ReactDOM.findDOMNode(this.refs.footer).style.width = el.clientWidth + "px";
			ReactDOM.findDOMNode(this.refs.roster).style.paddingTop = (ReactDOM.findDOMNode(this.refs.header).offsetHeight) + "px";
		}
	},

	renderFranchise: function() {
		var franchise = this.state.franchise;
		var next = this.state.next;
		var showLog = this.state.showLog;
		var draftResults = this.state.draftResults.filter((pick) => !!pick.player);

		if (showLog) {
			draftResults = draftResults.reverse();
		}
		else {
			draftResults = draftResults.filter((pick) => pick.franchise === franchise.id);
		}

		return <div className={"franchise-roster" + (showLog ? " franchise-roster-log" : "")} ref="roster" key="roster">
			<div className="franchise-status" ref="header">
				<a href="https://trophylife.io/" target="_blank" className="trophylife-link">
					<div className="trophylife"><span className="trophylife-logo"/>Trophy Life</div>
					{/* <div className="trophylife-description">A modern real-time fantasy football hosting platform for dynasty fanatics. Coming soon!</div> */}
				</a>
				<Team {...franchise} onClick={Actions.clearFranchise} />
				{next && next.difference !== null && <div className="franchise-next">
					{next.difference === 0
						? <span className="franchise-next-draft">It's my turn to pick #{parseInt(next.nextPick.round,10) + "." + next.nextPick.pick}!</span>
						: <span><span className="franchise-next-pick">{next.difference}</span> pick{next.difference !== 1 ? "s" : ""} until my next pick <span className="franchise-next-pick">#{parseInt(next.nextPick.round,10) + "." + next.nextPick.pick}</span></span>
					}
				</div>}
			</div>
			{draftResults
				.map((pick, i) => {
					var player = Players.byId(pick.player);
					return <Player key={(player ? player.id : i) + "-" + pick.round + "-" + pick.pick} {...player} pick={pick} compact={true} />;
				})
			}
			<div className="franchise-options" ref="footer">
				<label><input type="checkbox" checked={showLog} onChange={this.toggleLog} />Show log</label>
				<label><input type="checkbox" checked={this.state.showDepth} onChange={this.toggleDepth} />Show depth</label>
				{this.state.showDepth && 
					<Modal isOpen={this.state.showDepth} onRequestClose={this.toggleDepth} style={{
						overlay: { backgroundColor: "rgba(0,0,0,0.5)" }
					}}>
						<Depth franchise={this.state.franchise} league={this.state.league} draftResults={this.state.draftResults} rosters={this.state.rosters} />
					</Modal>
				}
			</div>
		</div>
	},

	render: function() {
		return <section className="franchise">
			{this.state.franchise
				? this.renderFranchise()
				: <div className="franchise-list" ref="list" key="list">
						<a href="https://trophylife.io/" target="_blank" className="trophylife-link">
							<div className="trophylife"><span className="trophylife-logo"/>Trophy Life</div>
							<div className="trophylife-description">A modern real-time fantasy football hosting platform for dynasty fanatics. Coming soon!</div>
						</a>
						{this.state.league && this.state.league.map((franchise) => <Team key={franchise.id} {...franchise} onClick={this.selectFranchise} />)}
					</div>
			}
		</section>
	}
});
