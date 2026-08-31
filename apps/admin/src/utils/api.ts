import { getEnvSafe } from '@rips/shared'

const adminApiKey = getEnvSafe('ADMIN_API_KEY')

export const adminApiHeader = {
	'x-admin-api-key': adminApiKey,
}
