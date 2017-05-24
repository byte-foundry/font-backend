import React from 'react';
import {Cell, Tooltip, ResponsiveContainer, PieChart, Pie} from 'recharts';

export default class PieChartElem extends React.PureComponent {
	render() {
		const colors = ['#2892ce', '#56f4b0', '#ce2887', '#f4e156', '#7956f4', '#65f456', '#ce28c6', '#7956f4'];
		const RADIAN = Math.PI / 180;
		const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent}) => {
			const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
			const x = cx + radius * Math.cos(-midAngle * RADIAN);
			const y = cy + radius * Math.sin(-midAngle * RADIAN);

			return (
				<text x={x} y={y}
					fill="white"
					textAnchor={x > cx ? 'start' : 'end'}
					dominantBaseline="central"
				>
					{`${(percent * 100).toFixed(0)}%`}
				</text>
			);
		};

		return (
			<div className="dataviz-container-item">
				<div className="dataviz-container-item-graph">
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={this.props.data}
								innerRadius={40}
						        outerRadius={100}
						        fill="#8884d8"
						        paddingAngle={5}
								label={renderCustomizedLabel}
								labelLine={false}
							>
							  {
								  this.props.data.map((entry, index) => {
									  return <Cell key={`cell${index}`} fill={colors[index % colors.length]}/>;
								  })
					          }
						    </Pie>
							<Tooltip/>
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className={`dataviz-container-item-fontname-${this.props.name}`}>{this.props.name}</div>
			</div>
		);
	}
}
