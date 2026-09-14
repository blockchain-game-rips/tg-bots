import { getEnvSafe } from '@rips/grammy-kit'
import { EligibilityFact } from './gate-request'
import { DEFAULT_GATE_PORT, startGateServer } from './gate-server'
import { MINI_APP_PAGE } from './mini-app-page'

export { EligibilityFact } from './gate-request'

const MIN_PORT = 1
const MAX_PORT = 65535

/**
 * Refuses a malformed port rather than passing it on: `Number('http://…')` is
 * `NaN`, and `listen(NaN)` binds an arbitrary free port, so a typo would put the
 * public listener somewhere nobody can predict instead of failing at startup.
 */
export function gatePort(configured: string | undefined): number {
	if (configured === undefined) return DEFAULT_GATE_PORT

	const port = Number(configured)

	if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
		throw new Error(`GATE_PORT is not a valid port: ${configured}`)
	}

	return port
}

/**
 * The gate's entry point — the one place the public half reads its own
 * configuration, so nothing it needs is threaded through the bot's wiring.
 *
 * `onFact` is supplied by the caller rather than resolved here: the gate reports
 * `{telegramId, country}` and stops, and what becomes of that fact — the
 * verdict, the write, the screen — belongs to the bot.
 */
export function startGate(
	onFact: (fact: EligibilityFact) => Promise<void>,
): void {
	// Read directly rather than through `getEnvSafe`, which throws on an absent
	// variable: the port is optional and has a defined meaning when unset.
	const port = gatePort(process.env['GATE_PORT'])

	startGateServer({
		botToken: getEnvSafe('BOT_TOKEN'),
		port,
		page: MINI_APP_PAGE,
		onFact,
	})
}
