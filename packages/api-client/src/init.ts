import { client } from '../generated/api-client/client.gen'
import { ApiError } from './api-error'

export function initApiClient(baseUrl: string): void {
	client.setConfig({
		baseUrl,
		kyOptions: { throwHttpErrors: false },
	})

	client.interceptors.error.use((error, response) => {
		return new ApiError(response.status, error)
	})
}
