import { ActionId } from '../types'

export const COMMAND_SEPARATOR = ':'

const MAX_CALLBACK_DATA_BYTES = 64

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
			`Callback data for action ${actionId} is ${byteLength} bytes, over Telegram's ${MAX_CALLBACK_DATA_BYTES}-byte limit`,
		)

	return data
}
