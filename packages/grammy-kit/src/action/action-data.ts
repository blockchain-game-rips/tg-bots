import { ActionData, ActionId } from '../types'

export const COMMAND_SEPARATOR = ':'

/**
 * Reserved id for the back button. Action ids are base-36 registry indices, so
 * a non-alphanumeric id can never collide with one. Back carries no payload, so
 * this is the whole callback data rather than a prefix.
 */
export const BACK_ACTION_ID = '-'

const MAX_CALLBACK_DATA_BYTES = 64

export function parseActionData(data: string): ActionData {
	const separatorIndex = data.indexOf(COMMAND_SEPARATOR)

	if (separatorIndex === -1) return { actionId: data, payload: undefined }

	return {
		actionId: data.slice(0, separatorIndex),
		payload: data.slice(separatorIndex + 1),
	}
}

const encoders = new Map<string, (v: unknown) => string>()

export function registerEncoder(
	id: string,
	encode: (v: unknown) => string,
): void {
	encoders.set(id, encode)
}

export function buildActionData<T>(actionId: ActionId<T>, value: T): string {
	if (value === undefined) return actionId

	const encode = encoders.get(actionId)

	if (encode === undefined)
		throw new Error(`No encoder registered for action: ${actionId}`)

	const encoded = encode(value)

	if (encoded.includes(COMMAND_SEPARATOR))
		throw new Error(
			`Encoded payload for action ${actionId} contains the reserved separator "${COMMAND_SEPARATOR}"`,
		)

	const data = `${actionId}${COMMAND_SEPARATOR}${encoded}`
	const byteLength = Buffer.byteLength(data, 'utf8')

	if (byteLength > MAX_CALLBACK_DATA_BYTES)
		throw new Error(
			`Callback data for action ${actionId} is ${String(byteLength)} bytes, over Telegram's ${String(MAX_CALLBACK_DATA_BYTES)}-byte limit`,
		)

	return data
}
