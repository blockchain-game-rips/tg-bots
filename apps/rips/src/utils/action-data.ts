import { ActionId } from '../types'

export const COMMAND_SEPARATOR = ':'

const encoders = new Map<string, (v: unknown) => string>()

export function registerEncoder(
	id: string,
	encode: (v: unknown) => string,
): void {
	encoders.set(id, encode)
}

export function buildActionData<T>(actionId: ActionId<T>, value: T): string {
	if (value === undefined) return actionId as string

	const encode = encoders.get(actionId as string)
	if (encode === undefined)
		throw new Error(
			`No encoder registered for action: ${actionId as string}`,
		)
	return `${actionId as string}${COMMAND_SEPARATOR}${encode(value)}`
}
