import fs from 'fs';
import config from './config.js';

/**
* set route for the application
* @param {object} - the application
*/
const setRoutes = function (app) {
	const OUTPUT_DIR = `./${config.outputDir}`;
	const DEFAULT_LIMIT = 50;
	const LOAD_MORE = 20;
	let updateLimit = DEFAULT_LIMIT;

	// set display route
	app.get('/display', (req, res) => {
		// redirect to login if no session
		if (!req.session.user) {
			res.redirect('login');
		}
		else {
			displayFileList(req, res, 'DISPLAY');
		}
	});
	app.get('/display/:length', (req, res) => {
		// redirect to login if no session
		if (!req.session.user) {
			res.redirect('login');
		}
		else {
			displayFileList(req, res, 'UPDATE');
		}
	});
	app.post('/display', (req, res) => {
		if (req.body.log_out) {
			req.session.user = undefined;
			res.redirect('/login');
		}
	});

	// set font access route
	app.get('/output/:font', (req, res) => {
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
	});

	// set public font access route
	app.get('/src/fonts/:font', (req, res) => {
		if (req.session.user) {
			if (req.params) {
				if (req.params.font) {
					fs.readFile(`./src/fonts/${req.params.font}`, (err, data) => {
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
	});

	/**
	* Display file list
	* @param {object} - the request
	* @param {object} - the response
	*/
	function displayFileList(req, res, action) {
		if (action === 'UPDATE') {
			updateLimit += LOAD_MORE;
		}
		else {
			updateLimit = DEFAULT_LIMIT;
		}

		fs.readdir(OUTPUT_DIR, (err, files) => {
			// get rid of the hidden files
			var files = files.filter(file => file.indexOf('.') !== 0)
				.sort((a, b) => {
					const aTokens = a.split('_');
					const bTokens = b.split('_');

					const aTimeWithExt = aTokens[aTokens.length - 1];
					const bTimeWithExt = bTokens[bTokens.length - 1];

					const aTime = aTimeWithExt.split('.')[0];
					const bTime = bTimeWithExt.split('.')[0];

					return bTime - aTime;
				})
				.map((file) => {
					const fileTokens = file.split('_');

					return {
						file,
						familyStyle: fileTokens[1],
						user: fileTokens[0],
					};
				});

			if (err) {
				res.status(500).send(err.message);
				console.log(err.message);
			}
			else {
				const users = getUsers(files);
				const fontFamilies = getFontFamilies(files);
				const limit = Math.min(updateLimit, files.length);
				const limited = limit === updateLimit;
				const limitedFiles = files.slice(0, updateLimit);
				const limitedUsers = getUsers(limitedFiles);
				const limitedFontFamilies = getFontFamilies(limitedFiles);
				const remaining = files.length - limit;
				const loadMore = Math.min(remaining, LOAD_MORE);

				if (action === 'DISPLAY') {
					res.render('fontList', {
						title: 'Font listing',
						header1: `Listing of "${OUTPUT_DIR}" directory`,
						limit,
						files: limited ? limitedFiles : files,
						users: limited ? limitedUsers : users,
						fontFamilies: limited ? limitedFontFamilies : fontFamilies,
						loadMore,
						remaining,
					});
				}
				else if (action === 'UPDATE') {
					res.send({
						limit,
						files: limited ? limitedFiles : files,
						users: limited ? limitedUsers : users,
						fontFamilies: limited ? limitedFontFamilies : fontFamilies,
						loadMore,
						remaining,
					});
				}
				else {
					res.end('Error');
				}
			}
		});
	}


	/**
	* authenticate a user
	* @param {string} - the unhashed password
	* @param {function} - a callback function to execute when the check has been successful
	* @param {function} - a callback function to execute when the check has not been successful
	*/
};

/**
* get unique users from an array of filenames
* @param {array} - an array of string (filenames)
* @return {array} users - an array of unique usernames
*/
function getUsers(files) {
	const users = files.map(file =>
		// map each file to its substring before the first '_' (the user name)
		 file.file.substring(0, file.file.indexOf('_'))).filter((user, index, array) =>
		// get rid of the duplicates and empty users
		 array.indexOf(user) === index && user !== '');

	return users;
}

/**
* get fonts families from an array of filenames
* @param {array} - an array of string (filenames)
* @return {array} families - an array of unique usernames
*/
function getFontFamilies(files) {
	const families = files.filter((file, index, array) =>
		// get rid of the duplicates
		 array.indexOf(file) === index).map((file) => {
		const family = file.file.substring(file.file.indexOf('_') + 1).replace(/(\.[A-z]*)$/g, '');

		return {family, file};
	});

	return families;
}

exports.setRoutes = setRoutes;
