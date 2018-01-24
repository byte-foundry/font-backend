import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Timeline from './overview/timeline/timeline.components.jsx';
import AreaChartElem from './overview/dataviz/area-chart-elem.components.jsx';
import Numbers from './overview/dataviz/numbers.components.jsx';
import PieChartElem from './overview/dataviz/pie-chart-elem.components.jsx';

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

export default class Overview extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			info: this.props.info || window.info,
		};
	}

	getParamCountByTemplate(templateName) {
		return _.chain(this.state.info)
			/*.filter((fontinfo) => {
			return moment(fontinfo.date).isAfter(moment().subtract(28, 'days'));
		})*/
		.groupBy('template')
		.get(templateName)
		.map('params')
		.reduce((sums, entry) => {
			Object.keys(entry).forEach(key => { sums[key] = (sums[key] || 0) + 1 })
			return sums;
		}, {})
		.map((val, key) => {
		    return {name: key, value: val};
	    })
	    .sortBy('value')
		.reverse()
		.take(8)
	    .value();
	}
	/*
	json.reduce(function(sums,entry){
   sums[entry.city] = (sums[entry.city] || 0) + 1;
   return sums;
},{});*/

	render() {
		const hello = _.chain(this.state.info)
		.filter((fontinfo) => {
			return moment(fontinfo.date).isAfter(moment().subtract(28, 'days'));
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

		const timeline = _.chain(this.state.info).sortBy('date').filter((fontinfo) => {
			return moment(fontinfo.date).isAfter(moment().subtract(28, 'days'));
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
				fill: ['#00e28b', '#ff725e', '#00c4d6', '#f5e462'][index % 4],
			};
		}).sortBy((info) => {
			return parseInt(info.name.split('-')[0]);
		}).value();

		const users = _.uniqBy(this.state.info, (item) => {
			return item.email;
		});

		return (
			<div className="overview-container">
				<div className="dataviz-container">
					<Numbers fontCount={this.state.info.length} userCount={users.length}/>
					<AreaChartElem data={hello}/>
					<div className="dataviz-container-title">
						<div className="dataviz-container-item-title">Most used parameters</div>
					</div>
					<PieChartElem data={this.getParamCountByTemplate('venus.ptf')} name="venus" />
					<PieChartElem data={this.getParamCountByTemplate('john-fell.ptf')} name="fell" />
					<PieChartElem data={this.getParamCountByTemplate('elzevir.ptf')} name="elzevir" />
					<PieChartElem data={this.getParamCountByTemplate('antique.ptf')} name="fell" />
					<PieChartElem data={this.getParamCountByTemplate('gfnt.ptf')} name="elzevir" />
				</div>
				<Timeline data={timeline}/>
			</div>
		);
	}
}
