import React from 'react';

import Sidebar from './sidebar.components.jsx';
import Header from './header.components.jsx';

export default class App extends React.PureComponent {
	render() {
		return (
			<div className="app">
				<Sidebar/>
				<Header/>
				{this.props.children}
			</div>
		);
	}
}
