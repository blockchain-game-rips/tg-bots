/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
	testEnvironment: 'node',

	transform: {
		'^.+\\.tsx?$': ['ts-jest', {}],
		'^(?!.*/generated/).*\\.js$': ['ts-jest', { diagnostics: false }],
	},
	transformIgnorePatterns: ['node_modules/(?!(ky)/)'],
	testMatch: ['<rootDir>/test/**/*.spec.ts'],

	testTimeout: 600_000,
}
