import { logger } from '@rips/grammy-kit'
import { createServer, IncomingMessage } from 'node:http'
import { Buffer } from 'node:buffer'
import { EligibilityFact, handleGateRequest, HTTP_OK } from './gate-request'

/**
 * The gate's own listener, separate from the metrics server on purpose: this is
 * the only port the tunnel is pointed at, and `/metrics` must never be.
 */
const DEFAULT_GATE_PORT = 8787

/**
 * Bound to loopback so the only way in is the tunnel running beside it. A port
 * open on every interface could be reached directly by anyone who learns the
 * origin's address, and such a caller sets `cf-ipcountry` to whatever they like.
 */
const LOOPBACK_ADDRESS = '127.0.0.1'

const HTTP_NOT_FOUND = 404
const HTTP_METHOD_NOT_ALLOWED = 405
const HTTP_PAYLOAD_TOO_LARGE = 413
const HTTP_SERVER_ERROR = 500

/**
 * A signed `initData` payload is well under this. The cap exists so an unsigned
 * caller cannot make the process hold an unbounded body in memory before the
 * signature is ever checked.
 */
const MAX_BODY_BYTES = 8 * 1024

const PAGE_ROUTE = '/'
const VERIFY_ROUTE = '/verify'

export interface GateServerConfig {
	botToken: string
	port: number
	devCountry: string | undefined
	isDevelopment: boolean

	/** The mini app page, served from memory so there is nothing to read at request time. */
	page: string

	onFact: (fact: EligibilityFact) => Promise<void>
}

/**
 * Starts the public half of the user process.
 *
 * Deliberately imports nothing from `utils/api`: `USER_API_KEY` moves user funds
 * and must not be reachable from code an unauthenticated caller can run. That
 * invariant is what makes it acceptable for this listener to share a process
 * with the bot, so a later split is a directory move rather than a redesign.
 */
export function startGateServer({
	botToken,
	port,
	devCountry,
	isDevelopment,
	page,
	onFact,
}: GateServerConfig): void {
	const server = createServer((request, response) => {
		const { url, method } = request

		if (url === PAGE_ROUTE && method === 'GET') {
			response
				.writeHead(HTTP_OK, { 'Content-Type': 'text/html' })
				.end(page)

			return
		}

		if (url !== VERIFY_ROUTE) {
			response.writeHead(HTTP_NOT_FOUND).end()

			return
		}

		if (method !== 'POST') {
			response.writeHead(HTTP_METHOD_NOT_ALLOWED).end()

			return
		}

		readBody(request)
			.then(async (body) => {
				if (body === undefined) {
					response.writeHead(HTTP_PAYLOAD_TOO_LARGE).end()

					return
				}

				const { status } = await handleGateRequest(
					{ headers: request.headers, body },
					{ botToken, devCountry, isDevelopment, onFact },
				)

				response.writeHead(status).end()
			})
			.catch((err: unknown) => {
				logger.error({ err }, 'Gate request failed')

				response.writeHead(HTTP_SERVER_ERROR).end()
			})
	})

	server.listen(port, LOOPBACK_ADDRESS, () => {
		logger.info(`Gate server listening on port ${port.toString()}`)
	})
}

export { DEFAULT_GATE_PORT }

/** Reads the body, or `undefined` once it grows past what a payload may be. */
async function readBody(request: IncomingMessage): Promise<string | undefined> {
	const chunks: Buffer[] = []

	let size = 0

	for await (const chunk of request) {
		if (!(chunk instanceof Buffer)) continue

		size += chunk.length

		if (size > MAX_BODY_BYTES) {
			request.destroy()

			return undefined
		}

		chunks.push(chunk)
	}

	return Buffer.concat(chunks).toString('utf8')
}
