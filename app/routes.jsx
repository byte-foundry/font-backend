/* @flow */
import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from './components/app.components.jsx';
import List from './components/list.components.jsx';
import Overview from './components/overview.components.jsx';
import Detail from './components/detail.components.jsx';
import NotFoundPage from './components/not-found-page.components.jsx';

const routes = (
	<Route path="/v1/" component={App}>
		<IndexRoute component={Overview} />
		<Route path="/v1/list" component={List} />
		<Route path="/v1/detail/:id" component={Detail} />
		<Route path="*" component={NotFoundPage} />
	</Route>
);

export default routes;
