module.exports = {
	preset: 'jest-preset-angular',
	globalSetup: 'jest-preset-angular/global-setup',

	collectCoverage: true,
	coverageDirectory: 'coverage',

	coverageThreshold: {
	global: {
		statements: 80,
		branches: 80,
		functions: 80,
		lines: 80
	}
	}
};
