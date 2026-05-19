// @ts-check

import eslint from '@eslint/js'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
	},
	{
		ignores: ['**/generated/**', '**/dist/**', '**/openapi-ts.config.ts'],
	},
	{
		plugins: {
			'unused-imports': unusedImports,
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
		},
	},
)
