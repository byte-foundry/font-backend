import React from 'react';
import {AreaChart, Area, XAxis, YAxis, Legend, Tooltip, ResponsiveContainer, PieChart, Pie} from 'recharts';
import moment from 'moment';
import _ from 'lodash';

function getThicknessGroup(thickness) {
	let result = '0 - 50';

	if (thickness > 50) {
		result = '51 - 100';
	}
	if (thickness > 100) {
		result = '101 - 150';
	}
	if (thickness > 150) {
		result = '151 - 200';
	}
	if (thickness > 200) {
		result = '201+';
	}
	return result;
}
export default class Numbers extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			info: this.props.info || window.info,
		};
	}

	render() {

		const hello = _.chain(this.state.info).filter((fontinfo) => {
			return moment(fontinfo.date).isAfter(moment().subtract(14, 'days'));
		}).groupBy((dateItem) => {
				return moment(dateItem.date).format('DD-MM-YYYY');
		}).map((fontinfo, key) => {
			const byTemplate = _.countBy(fontinfo, (info) => {
				return info.template;
			});

			const result = {
				name: key,
			};

			_.forEach(byTemplate, (count, template) => {
				result[template] = count;
			});
			return result;
		}).sortBy((data) => {
			return moment(data.name, 'DD-MM-YYY').unix();
		}).value();

		const thicknessGroup = _.chain(this.state.info).countBy((info) => {
			return getThicknessGroup(info.params.thickness);
		}).map((fontinfo, key) => {
			return {
				name: key,
				thickness: fontinfo,
			};
		}).map((obj, index) => {
			return {
				...obj,
				fill: ['#00e28b', '#ff725e', '#00c4d6', '#f5e462'][index%4],
			}
		}).sortBy((info) => {
			return parseInt(info.name.split('-')[0]);
		}).value();

		const users = _.uniqBy(this.state.info, (item) => {
			return item.email;
		});

		return (
			<div className="container">
				<div className="container-small-item">
					<span className="container-small-item-big">{this.state.info.length} </span>font exports
				</div>
				<div className="container-small-item">
					<span className="container-small-item-big">{users.length} </span>users exported
				</div>
				<div className="container-small-item">
					<span className="container-small-item-big">{users.length} </span>users exported
				</div>
				<div className="container-item-full">
					<div className="container-item-full-title">All</div>
					<div className="container-item-graph">
						<ResponsiveContainer>
							<AreaChart data={hello}
								margin={{top: 10, right: 30, left: 0, bottom: 0}}>
								<XAxis dataKey="name"/>
								<YAxis/>
								<Tooltip/>
								<Legend verticalAlign="top" height={36}/>
								<Area type="monotone" dataKey="john-fell.ptf" stackId="1" stroke="#00e28b" fill="#24d390" />
								<Area type="monotone" dataKey="venus.ptf" stackId="1" stroke="#ff725e" fill="#f56954" />
								<Area type="monotone" dataKey="elzevir.ptf" stackId="1" stroke="#00c4d6" fill="#00bdd0" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="container-item">
					<div className="container-item-title">All</div>
					<div className="container-item-graph">
							<PieChart width={300} height={250}>
								<Pie fill="#8884d8" isAnimationActive={false} cx="50%" cy="50%" data={thicknessGroup} innerRadius={20} outerRadius={80}/>
								<Tooltip/>
							</PieChart>
					</div>
				</div>
				<div className="container-item">
					<div className="container-item-title">All</div>
					<div className="container-item-graph">
						<ResponsiveContainer>
							<AreaChart data={hello}
								margin={{top: 10, right: 30, left: 0, bottom: 0}}>
								<XAxis dataKey="name"/>
								<YAxis/>
								<Tooltip/>
								<Legend verticalAlign="top" height={36}/>
								<Area type="monotone" dataKey="john-fell.ptf" stackId="1" stroke="#8884d8" fill="#8884d8" />
								<Area type="monotone" dataKey="venus.ptf" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
								<Area type="monotone" dataKey="elzevir.ptf" stackId="1" stroke="#ffc658" fill="#ffc658" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="container-item">
					<div className="container-item-title">All</div>
					<div className="container-item-graph">
						<ResponsiveContainer>
							<AreaChart data={hello}
								margin={{top: 10, right: 30, left: 0, bottom: 0}}>
								<XAxis dataKey="name"/>
								<YAxis/>
								<Tooltip/>
								<Legend verticalAlign="top" height={36}/>
								<Area type="monotone" dataKey="john-fell.ptf" stackId="1" stroke="#8884d8" fill="#8884d8" />
								<Area type="monotone" dataKey="venus.ptf" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
								<Area type="monotone" dataKey="elzevir.ptf" stackId="1" stroke="#ffc658" fill="#ffc658" />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		);
	}
}
