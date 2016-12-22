/* @flow */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import path from 'path';

import config from './config.js';
import {
	basicPost,
	handleDownloadPostRequest,
	handleFilePostRequest,
	handleInfoPostRequest,
	loginGet,
	loginPost,
	displayReact,
	getFont,
	getFontInfos,
} from './handlers.js';

const app = express();

// set routes
// user urlencoded
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'static')));
// configure jade templating engine
app.set('views', './app/views');
	// configure sessions
app.set('view engine', 'pug');

if (app.get('env') === 'production') {
  config.sessionSetup.cookie.secure = true; // serve secure cookies
}
app.use(session(config.sessionSetup));

// set login route

// add cross origin authorizations
app.use(cors({
	origin: config.corsOrigin,
}));
// enable gzip compression
app.use(compression());
app.post('/fontinfo/:id', bodyParser.json({type: 'application/json'}), handleInfoPostRequest);
app.post('/fontfile/:id/:overlap', bodyParser.raw({type: 'application/otf'}), handleFilePostRequest);
app.post('/fontfile/:id', bodyParser.raw({type: 'application/otf'}), handleFilePostRequest);
app.post('/:font/:user', bodyParser.raw({type: 'application/otf'}), basicPost);
app.post('/:fontFam/:fontStyle/:user', bodyParser.raw({type: 'application/otf'}), handleDownloadPostRequest);
app.post('/:fontFam/:fontStyle/:user/:template', bodyParser.raw({type: 'application/otf'}), handleDownloadPostRequest);
app.post('/:fontFam/:fontStyle/:user/:template/:overlap', bodyParser.raw({type: 'application/otf'}), handleDownloadPostRequest);
app.get('/fontinfo', getFontInfos);
app.get('/output/:font', getFont);
app.get('/login', loginGet);
app.post('/login', loginPost);
//routes.setRoutes(app);
app.get('*', displayReact);
//launch stuff
app.listen(config.port, function() {
	console.log(`listening on port ${config.port}`);
});


