import {
	createServer,
	type IncomingMessage,
	type Server,
	type ServerResponse,
} from 'node:http'
import { afterEach, beforeEach, expect, it } from 'vitest'
import {
	initApiClient,
	isApiErrorWithStatus,
	usersControllerGetUser,
} from '../src'

const NOT_FOUND = 404

let server: Server

function baseUrlOf(server: Server): string {
	const address = server.address()

	if (address === null || typeof address === 'string') {
		throw new Error('server is not listening on a TCP port')
	}

	return `http://127.0.0.1:${address.port.toString()}`
}

beforeEach(async () => {
	server = createServer((_req: IncomingMessage, res: ServerResponse) => {
		res.writeHead(NOT_FOUND, { 'content-type': 'application/json' })
		res.end(JSON.stringify({ statusCode: NOT_FOUND, message: 'nope' }))
	})

	await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

	initApiClient(baseUrlOf(server))
})

afterEach(async () => {
	await new Promise<void>((resolve, reject) => {
		server.close((error) => {
			if (error) reject(error)
			else resolve()
		})
	})
})

it('throws ApiError with the response status on a non-2xx response', async () => {
	await expect(
		usersControllerGetUser({ path: { telegramId: '1' } }),
	).rejects.toSatisfy((error) => isApiErrorWithStatus(error, NOT_FOUND))
})
