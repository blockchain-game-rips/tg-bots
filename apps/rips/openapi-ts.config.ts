import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
	input: './open-api.json',
	output: 'generated/api-client',
	plugins: ['@hey-api/client-ky'],
})
