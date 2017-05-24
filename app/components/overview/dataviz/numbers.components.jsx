import React from 'react';

export default class Numbers extends React.PureComponent {
	render() {
		return (
			<div className="dataviz-container-numbers">
				<div className="dataviz-container-small-item">
					<span className="dataviz-container-small-item-big">{this.props.fontCount} </span> exported fonts
				</div>
				<div className="dataviz-container-small-item">
					<span className="dataviz-container-small-item-big">{this.props.userCount} </span> users exporting
				</div>
				<div className="dataviz-container-small-item">
					<span className="dataviz-container-small-item-big">~{(this.props.fontCount / this.props.userCount).toFixed(2)} </span> fonts per user
				</div>
			</div>
		);
	}
}
