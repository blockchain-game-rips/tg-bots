import { client } from '../generated/api-client/client.gen'
import { ApiError } from './api-error'

/** A network failure produces no response, so there is no HTTP status to report. */
const NO_RESPONSE_STATUS = 0

export function initApiClient(baseUrl: string): void {
	client.setConfig({
		baseUrl,
		kyOptions: { throwHttpErrors: false },
	})

	client.interceptors.error.use((error, response) => {
		return new ApiError(response?.status ?? NO_RESPONSE_STATUS, error)
	})
}
