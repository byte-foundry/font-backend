import React from 'react';

import Sidebar from './sidebar.components.jsx';

export default class App extends React.PureComponent {
	render() {
		return (
			<div className="app">
				<Sidebar/>
				{this.props.children}
			</div>
		);
	}
}
