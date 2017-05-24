import React from 'react';
import TimelineElem from './timeline-elem.components.jsx';

export default class Timeline extends React.PureComponent {
	render() {
		return (
			<div className="timeline-container">
				<h2>Latest activity </h2>
				{this.props.data.slice(0, 7).map((elem) => {
					return (
						<TimelineElem data={elem} key={elem.id}/>
					);
				})}
			</div>
		);
	}
}
