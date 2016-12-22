/* @flow */
import fs from 'fs';
import {exec} from 'child_process';
import slug from 'slug';
import type {SlugOptions} from 'slug';
import bcrypt from 'bcrypt';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {match, RouterContext} from 'react-router';
import low from 'lowdb';
import fileAsync from 'lowdb/lib/file-async';
import path from 'path';

import config from './config.js';
import routes from './routes.jsx';
import NotFoundPage from './components/not-found-page.components.jsx';

const slugOptions: SlugOptions = {
	...slug.defaults.modes.pretty,
	remove: /[0-9,\.,_,-]/g,
};
const outputDir: string = config.outputDir;
const fontDir: string = config.fontDir;
const tempDir: string = config.tempDir;
const db = low(path.join(__dirname, 'data/info.json'), {
	storage: fileAsync,
	writeOnChange: false,
});

db.defaults({fonts: []}).value();

export function basicPost(req: express$Request, res: express$Response) {

	const fileName: string = `${req.params.user}_${req.params.font}${(new Date()).getTime()}`;

	if (req.body instanceof Buffer) {
		fs.writeFile(`${tempDir}${fileName}.otf`, req.body,
			function() {

				exec(`./removeOverlap.pe ${fileName}.otf`, {maxBuffer: 1024 * 800}, function(err) {
					if (err) {
						console.log(`Error while converting font with fileName: ${fileName} ${err.message}`);
						fs.unlinkSync(`${tempDir}${fileName}.otf`);
						res.sendStatus(500);
					}

					res.download(`${outputDir}${fileName}.otf`, `${fileName}.otf`, function() {
						console.log(`Successfully converted font with fileName: ${fileName}`);
					});
				});
			});
	}
}

export function handleFilePostRequest(req: express$Request, res: express$Response) {
	const id: string = req.params.id;
	const fileName: string = `${id}.otf`;

	if (req.body instanceof Buffer) {
		if (req.params.overlap) {
			fs.writeFile(``, req.body, () => {
				exec(`./removeOverlapFont.pe ${fileName}`, {maxBuffer: 1024 * 800}, (err) => {
					if (err) {
						console.log(`Error while converting font with fileName: ${fileName} ${err.message}`);
						fs.unlinkSync(`${tempDir}${fileName}`);
						res.sendStatus(500);
					}
					else {
						res.download(`${fontDir}${fileName}`, fileName, () => {
							console.log(`Successfully converted font with fileName: ${fileName}`);
						});
					}
				});
			});
		}
		else {
			fs.writeFile(`${fontDir}${fileName}`, req.body, function(err) {
				if (err) {
					console.log(`Error while downloading font with fileName: ${fileName} ${err.message}`);
					res.sendStatus(500);
				}
				else {

					console.log(`Successfully downloaded font with fileName: ${fileName}`);
					const name: string = `${fontDir}${fileName}`;

					res.download(name, `${id}.otf`, () => {
						if (req.params.user === 'plumin') {
							setTimeout(function() {
								fs.unlinkSync(`${fontDir}${fileName}`);
							}, 3000);
						}
					});
				}
			});
		}
	}
	else {
		console.log(`req.body is not a Buffer and that's fucked up`);
		res.sendStatus(500);
	}
}

export function handleInfoPostRequest(req: express$Request, res: express$Response) {
	console.log('fontinfo');
	const id: string = req.params.id;

	if (req.body instanceof Object) {
		const body: Object = req.body;
		const fonts = db.get('fonts');

		if (fonts.find({id}).value()) {
			console.log(`${id} already exists`);
			res.sendStatus(409);
		}
		else {
			db.get('fonts').push({...body, id}).value();
			db.write()
				.then(() => {
					console.log(`Successfully created : ${id}`);
					res.sendStatus(200);
				})
				.catch((err) => {
					console.log(`Error while downloading info with id: ${id} ${err.message}`);
					res.sendStatus(500);
				});
		}
	}
}

/**
*	Handle Dowload Request
* Will output a font file on the server and start the download
* file name structure : user_fontName_template_id
* @param {object} - the request
* @param {object} - the response
*/
export function handleDownloadPostRequest(req: express$Request, res: express$Response) {
	// build file name
	let fileName: string = `${req.params.user}_${slug(req.params.fontFam, slugOptions)}-${slug(req.params.fontStyle, slugOptions)}`;

	// add template to the file name
	if (req.params.template) {
		fileName += `_${req.params.template}`;
	}

	// add a timestamp-based id the the file name
	fileName += `_${(new Date()).getTime()}`;

	// the 'merged' button has been clicked
	// run the removeOverlap script
	if (req.body instanceof Buffer) {
		if (req.params.overlap) {
			fs.writeFile(`${tempDir}${fileName}.otf`, req.body, () => {
				exec(`./removeOverlap.pe ${fileName}.otf`, {maxBuffer: 1024 * 800}, (err) => {
					if (err) {
						console.log(`Error while converting font with fileName: ${fileName} ${err.message}`);
						fs.unlinkSync(`${tempDir}${fileName}.otf`);
						res.sendStatus(500);
					}

					res.download(`${outputDir}${fileName}.otf`, `${fileName}.otf`, () => {
						console.log(`Successfully converted font with fileName: ${fileName}`);
						fs.unlinkSync(`${tempDir}${fileName}.otf`);
						if (req.params.user === 'plumin') {
							setTimeout(function() {
								fs.unlinkSync(`${outputDir}${fileName}.otf`);
							}, 3000);
						}
					});
				});
			});
		}
		else {
			fs.writeFile(`${outputDir}${fileName}.otf`, req.body, function(err) {
				if (err) {
					console.log(`Error while downloading font with fileName: ${fileName} ${err.message}`);
				}

				console.log(`Successfully downloaded font with fileName: ${fileName}`);
				const name: string = `${outputDir}${fileName}.otf`;

				res.download(name, `${fileName}.otf`, function() {
					if (req.params.user === 'plumin') {
						setTimeout(function() {
							fs.unlinkSync(`${outputDir}${fileName}.otf`);
						}, 3000);
					}
				});
			});
		}
	}

}

export function loginGet(req: express$Request, res: express$Response): void {
	if (req.session && req.session.user) {
		res.redirect('/');
	}
	else {
		res.render('login', {
			title: 'Fontlist - Login',
			header1: 'Please log in',
		});
	}
}

function authenticate(password: string, passHash: string, successCallback: () => void, errorCallback: () => void) {
	bcrypt.compare(password, passHash)
		.then((res) => {
			if (res) {
				return successCallback();
			}
			else {
				return errorCallback();
			}
		})
		.catch(() => {
			return errorCallback();
		});
}

export function loginPost(req: express$Request, res: express$Response): void {
	if (req.body && typeof req.body.login_password === 'string' && req.body.login_password) {
		authenticate(req.body.login_password, config.passHash,
			// success callback
			() => {
				if (req.session) {
					req.session.user = 'authenticate';
					res.redirect('/');
				}
			// error callback
			},
			() => {
				if (req.session) {
					req.session.user = undefined;
					res.status(401).render('login', {
						title: 'Fontlist - Login',
						header1: 'Please log in',
						failed: true,
						errorMessage: 'Wrong password',
					});
				}
			}
		);
	}
}

export function displayReact(req: express$Request, res: express$Response): void {
	if (req.session.user) {
		match(
			{routes, location: req.url},
			(err, redirectLocation, renderProps) => {
				if (err) {
					return res.status(500).send(err.message);
				}

				if (redirectLocation) {
					return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
				}

				let markup: string;
				const info = [...db.get('fonts').value()];

				if (renderProps) {
					markup = renderToString(
						<RouterContext
							{...renderProps}
							createElement={
								(Component, props) => {
									return <Component {...props} info={info} />;
								}
							}
						/>
					);
				}
				else {
					markup = renderToString(<NotFoundPage/>);
					res.status(404);
				}

				res.render('index', {markup, info});
			}
		);
	}
	else {
		res.redirect('login');
	}
}

export function getFont(req: express$Request, res: express$Response) {
	if (req.session.user) {
		if (req.params) {
			if (req.params.font) {
				fs.readFile(config.outputDir + req.params.font, (err, data) => {
					if (err) {
						res.status(404).end(err.message);
					}
					else {
						res.send(data);
					}
				});
			}
		}
	}
	else {
		res.status(403).end('Acces denied');
	}
}

export function getFontInfos(req: express$Request, res: express$Response) {
	res.send(db.get('fonts').value());
}
