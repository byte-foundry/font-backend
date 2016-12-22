/* @flow */
import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './components/app.components.jsx';
import List from './components/list.components.jsx';
import Numbers from './components/numbers.components.jsx';
import Detail from './components/detail.components.jsx';
import NotFoundPage from './components/not-found-page.components.jsx';

const routes = (
	<Route path="/" component={App}>
		<IndexRoute component={Numbers}/>
		<Route path="/list" component={List}/>
		<Route path="/detail/:id" component={Detail}/>
		<Route path="*" component={NotFoundPage}/>
	</Route>
);

export default routes;
