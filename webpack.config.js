const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: path.join(__dirname, 'app', 'client.js'),
	output: {
		path: path.join(__dirname, 'app', 'static', 'js'),
		filename: 'bundle.js',
	},
	module: {
		loaders: [
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass'],
			},
			{
				test: /\.jsx?$/,
				loader: ['babel-loader'],
				query: {
					cacheDirectory: 'babel_cache',
				},
			},
			{
		      test: /\.(png|jpg|)$/,
		      loader: 'url-loader?limit=200000',
		    },
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		}),
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
	],
};
