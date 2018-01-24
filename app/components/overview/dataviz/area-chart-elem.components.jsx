import React from 'react';
import {AreaChart, Area, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer} from 'recharts';

export default class AreaChartElem extends React.PureComponent {
	render() {
		return (
			<div className="dataviz-container-item-full">
				<div className="dataviz-container-item-full-title">Template popularity</div>
				<div className="dataviz-container-item-graph">
					<ResponsiveContainer>
						<AreaChart data={this.props.data}
							margin={{top: 10, right: 30, left: 0, bottom: 0}}>
							<XAxis dataKey="name"/>
							<YAxis/>
							<Tooltip/>
							<Legend verticalAlign="top" height={36}/>
							<Area type="monotone" dataKey="john-fell.ptf" stackId="1" stroke="#00e28b" fill="#24d390" />
							<Area type="monotone" dataKey="venus.ptf" stackId="1" stroke="#ff725e" fill="#f56954" />
							<Area type="monotone" dataKey="antique.ptf" stackId="1" stroke="#00adc0" fill="#00bdd0" />
							<Area type="monotone" dataKey="gfnt.ptf" stackId="1" stroke="#43a58b" fill="#63c5ab" />
							<Area type="monotone" dataKey="elzevir.ptf" stackId="1" stroke="#d4ba38" fill="#e4ca48" />
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	}
}
