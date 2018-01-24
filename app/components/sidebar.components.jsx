import React from 'react';
import {Link} from 'react-router';

export default class Sidebar extends React.PureComponent {
	render() {
		return (
			<div className="sidebar">
				<div className="sidebar-title"><img src="http://img11.hostingpics.net/pics/704143logo.jpg" alt="Prototypo logo" /></div>
				<Link to="/v1/"><div className="sidebar-item">Overview</div></Link>
				<Link to="/v1/list"><div className="sidebar-item">Fonts</div></Link>
			</div>
		);
	}
}
