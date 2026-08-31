import { getEnvSafe } from '../common'

/**
 * Read on first use, not at import time: the preview bot imports pages that
 * reach this module transitively yet never calls the api, so it must start
 * without the key. A missing key still fails on the first real request.
 */
export function userApiKey(): string {
	return getEnvSafe('USER_API_KEY')
}
