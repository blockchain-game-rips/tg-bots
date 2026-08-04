import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
	input: './openapi.json',
	output: 'generated/api-client',
	plugins: [{ name: '@hey-api/client-ky', throwOnError: true }],
})
