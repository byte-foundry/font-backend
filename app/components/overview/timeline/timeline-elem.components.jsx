import React from 'react';
import moment from 'moment';

export default class TimelineElem extends React.PureComponent {
	render() {
		const fontName = this.props.data.template.split(".")[0];

		return (
			<div className="timeline-elem">
				<p>
					{moment(this.props.data.date).fromNow()} <br/>
					<span className={`color-${fontName}`}>{this.props.data.template}</span> exported <br/>
					by {this.props.data.email}
				</p>
				<hr/>
			</div>
		);
	}
}
