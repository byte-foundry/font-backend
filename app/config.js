//@flow

type BackendConfig = {
	port: number,
	domain: string,
	corsOrigin: Array<string>,
	fontDir: string,
	tempDir: string,
	outputDir: string,
	passHash: string,
	sessionSetup: {
		secret: string,
		resave: boolean,
		saveUninitialized: boolean,
		cookie: Object,
	},
};

const config: BackendConfig = {
	port: 80,
	domain: 'http://merge.prototypo.io/',
	corsOrigin: ['https://newui.prototypo.io', 'https://dev.prototypo.io', 'https://app.prototypo.io', 'https://beta.prototypo.io', 'http://localhost:9000'],
	fontDir: 'app/data/fonts/',
	outputDir: 'app/data/fonts/',
	tempDir: 'tmp/',
	passHash: '$2a$10$42ZrBx35lxqyq9vndYYGBeqFEKCVvqNBfKXBPrBIY1yzpk5LBg5KS',
	sessionSetup: {
		secret: 'fontlist-output',
		resave: false,
		saveUninitialized: true,
		cookie: {},
	},
};

if (process.env.NODE_ENV === 'development') {
	config.port = 3000;
	config.domain = 'http://localhost/';
	config.corsOrigin = ['http://localhost:9000'];
}

export default config;
