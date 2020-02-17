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

import config from './config';
import routes from './routes';
import NotFoundPage from './components/not-found-page.components';

const slugOptions: SlugOptions = {
	...slug.defaults.modes.pretty,
	remove: /[,.]/g,
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
	const fileName: string = `${slug(req.params.user, slugOptions)}_${(new Date()).getTime()}`;

	if (req.body instanceof Buffer) {
		fs.writeFile(
			`${tempDir}${fileName}.otf`, req.body,
			(err) => {
				if (err) throw err;

				exec(`./removeOverlap.pe ${fileName}.otf`, {maxBuffer: 1024 * 800}, (err) => {
					if (err) {
						exec(`pkill -f ${fileName}`);
						console.log(`[basicPost] Error while converting font with fileName: ${fileName} ${err.message}`);
						fs.unlinkSync(`${tempDir}${fileName}.otf`);
						res.sendStatus(500);
					}

					res.download(`${outputDir}${fileName}.otf`, `${fileName}`, () => {
						console.log(`[basicPost] Successfully converted font with fileName: ${fileName}`);
						try {
							fs.unlinkSync(`${outputDir}${fileName}.otf`);
							fs.unlinkSync(`${tempDir}${fileName}.otf`);
							console.log(`[basicPost] Successfully destroyed merged font with fileName: ${fileName}`);
						}
						catch (e) {
							console.log(`[basicPost] Error while deleting ${fileName}.otf`);
						}
					});
				});
			},
		);
	}
}

export function handleFilePostRequest(req: express$Request, res: express$Response) {
	const id: string = req.params.id;
	const dbFileName: string = `${id}.otf`;
	const fileName: string = `${slug(req.params.family, slugOptions)}-${slug(req.params.style, slugOptions)}.otf`;

	if (req.body instanceof Buffer) {
		if (req.params.overlap) {
			fs.writeFile(tempDir + dbFileName, req.body, () => {
				exec(`./removeOverlap.pe ${dbFileName}`, {maxBuffer: 1024 * 800}, (err) => {
					if (err) {
						exec(`pkill -f ${fileName}`);
						console.log(`[handleFilePostRequest:overlap] Error while converting font with fileName: ${dbFileName} ${err.message}`);
						try {
							fs.unlinkSync(`${tempDir}${dbFileName}`);
						}
						catch (e) {
							console.log(`[handleFilePostRequest:overlap] Error while deleting ${dbFileName}.otf`);
						}
						res.sendStatus(500);
					}
					else {
						res.download(`${fontDir}${dbFileName}`, fileName, () => {
							try {
								fs.unlinkSync(`${fontDir}${dbFileName}`);
								fs.unlinkSync(`${tempDir}${dbFileName}`);
								console.log(`[basicPost] Successfully destroyed merged font with fileName: ${fileName}`);
							}
							catch (e) {
								console.log(`[basicPost] Error while deleting ${fileName}.otf`);
							}
							console.log(`[handleFilePostRequest:overlap] Successfully converted font with fileName: ${fileName}`);
						});
					}
				});
			});
		}
		else {
			fs.writeFile(fontDir + dbFileName, req.body, (err) => {
				if (err) {
					console.log(`[handleFilePostRequest:no-overlap] Error while downloading font with fileName: ${dbFileName} ${err.message}`);
					res.sendStatus(500);
				}
				else {
					const name: string = `${fontDir}${dbFileName}`;

					res.download(name, fileName, () => {
						console.log(`[handleFilePostRequest:no-overlap] Successfully downloaded font with fileName: ${dbFileName}`);
						if (req.params.user === 'plumin') {
							setTimeout(() => {
								fs.unlinkSync(`${fontDir}${fileName}`);
							}, 3000);
						}
					});
				}
			});
		}
	}
	else {
		console.log('req.body is not a Buffer and that\'s fucked up');
		res.sendStatus(500);
	}
}

export function handleInfoPostRequest(req: express$Request, res: express$Response) {
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
					console.log(`[handleInfoPostRequest] Successfully created info for ${id}`);
					res.sendStatus(200);
				})
				.catch((err) => {
					console.log(`[handleInfoPostRequest] Error while downloading info with id: ${id} ${err.message}`);
					res.sendStatus(500);
				});
		}
	}
}

export function loginGet(req: express$Request, res: express$Response): void {
	if (req.session && req.session.user) {
		res.redirect('/v1/');
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

			return errorCallback();
		})
		.catch(() => errorCallback());
}

export function loginPost(req: express$Request, res: express$Response): void {
	if (req.body && typeof req.body.login_password === 'string' && req.body.login_password) {
		authenticate(
			req.body.login_password, config.passHash,
			// success callback
			() => {
				if (req.session) {
					req.session.user = 'authenticate';
					res.redirect('/v1/');
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
			},
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
					markup = renderToString(<RouterContext
						{...renderProps}
						createElement={
							(Component, props) => <Component {...props} info={info} />
						}
					/>);
				}
				else {
					markup = renderToString(<NotFoundPage />);
					res.status(404);
				}

				res.render('index', {markup, info});
			},
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
