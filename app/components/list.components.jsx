import React from 'react';

export default class List extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			info: this.props.info || window.info,
		}
	}

	render() {
		const fonts = this.state.info.map((fontinfo) => {
			return (
				<div>
					<h1>{fontinfo.family} {fontinfo.style}</h1>
					<div>{fontinfo.template}</div>
				</div>
			)
		});
		return <div>{fonts}</div>;
	}
}
