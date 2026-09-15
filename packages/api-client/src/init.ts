import { client } from '../generated/api-client/client.gen'
import { ApiError } from './api-error'

/** A network failure produces no response, so there is no HTTP status to report. */
const NO_RESPONSE_STATUS = 0

export const REQUEST_ID_HEADER = 'x-request-id'

/**
 * Supplies the id of the button press a call belongs to, or `undefined` for
 * calls made outside one, such as the notifier. The caller owns the source so
 * the client stays unaware of how a bot tracks a request.
 */
export type RequestIdProvider = () => string | undefined

export function initApiClient(
	baseUrl: string,
	provideRequestId?: RequestIdProvider,
): void {
	client.setConfig({
		baseUrl,
		kyOptions: {
			throwHttpErrors: false,
			hooks: {
				beforeRequest: [
					({ request }) => {
						const requestId = provideRequestId?.()

						if (requestId === undefined) return

						request.headers.set(REQUEST_ID_HEADER, requestId)
					},
				],
			},
		},
	})

	client.interceptors.error.use((error, response) => {
		return new ApiError(response?.status ?? NO_RESPONSE_STATUS, error)
	})
}
