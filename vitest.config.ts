import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const TEST_TIMEOUT_MS = 600_000

const repoRoot = import.meta.dirname

const project = (name: string) => ({
	extends: true,
	test: {
		name,
		root: resolve(repoRoot, name),
	},
})

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		testTimeout: TEST_TIMEOUT_MS,
		include: ['test/**/*.spec.ts'],

		projects: [
			project('apps/admin'),
			project('apps/user'),
			project('packages/api-client'),
			project('packages/shared'),
			project('packages/grammy-kit'),
		],
	},
})
