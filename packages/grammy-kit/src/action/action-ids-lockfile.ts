import { BACK_ACTION_ID, COMMAND_SEPARATOR } from './action-data'

/**
 * Action ids used to be the position of the action among its declarations, so
 * inserting an action shifted every later id and made buttons already sitting in
 * Telegram chats resolve to a different handler. The lockfile makes an id a
 * property of the action itself: it is allocated once, committed to git, and
 * never derived from position again.
 */
export interface ActionIdLockfile {
	ids: Record<string, string>

	/** Monotonic allocator cursor. Never decreases, so a freed id is never reissued. */
	next: string
}

export interface AllocationResult {
	lockfile: ActionIdLockfile
	changed: boolean
}

const ID_RADIX = 36
const FIRST_ID = '0'

function toId(cursor: number): string {
	return cursor.toString(ID_RADIX)
}

function fromId(id: string): number {
	return parseInt(id, ID_RADIX)
}

function assertNamesAreUsable(names: string[]): void {
	const seen = new Set<string>()

	names.forEach((name) => {
		if (name.includes(COMMAND_SEPARATOR))
			throw new Error(
				`Action name "${name}" contains the reserved separator "${COMMAND_SEPARATOR}"`,
			)

		if (seen.has(name)) throw new Error(`Duplicate action name: "${name}"`)

		seen.add(name)
	})
}

export function allocateActionIds(
	lockfile: ActionIdLockfile,
	declaredNames: string[],
): AllocationResult {
	assertNamesAreUsable(declaredNames)

	const ids: Record<string, string> = {}
	let cursor = fromId(lockfile.next)

	declaredNames.forEach((name) => {
		const existing = lockfile.ids[name]

		if (existing !== undefined) {
			ids[name] = existing

			return
		}

		ids[name] = toId(cursor)
		cursor += 1
	})

	const next = toId(cursor)
	const changed =
		next !== lockfile.next ||
		Object.keys(lockfile.ids).length !== Object.keys(ids).length

	return { lockfile: { ids, next }, changed }
}

export function assertLockfileCovers(
	lockfile: ActionIdLockfile,
	declaredNames: string[],
): void {
	assertNamesAreUsable(declaredNames)

	const missing = declaredNames.filter(
		(name) => lockfile.ids[name] === undefined,
	)

	if (missing.length > 0)
		throw new Error(
			`Action ids missing from the lockfile: ${missing.join(', ')}. Run the action-ids sync script.`,
		)

	const registered = new Set(declaredNames)
	const orphaned = Object.keys(lockfile.ids).filter(
		(name) => !registered.has(name),
	)

	if (orphaned.length > 0)
		throw new Error(
			`Lockfile holds actions that are no longer declared: ${orphaned.join(', ')}. Run the action-ids sync script.`,
		)

	const seenIds = new Map<string, string>()
	const cursor = fromId(lockfile.next)

	Object.entries(lockfile.ids).forEach(([name, id]) => {
		const owner = seenIds.get(id)

		if (owner !== undefined)
			throw new Error(
				`Duplicate action id "${id}" shared by "${owner}" and "${name}"`,
			)

		seenIds.set(id, name)

		if (id === BACK_ACTION_ID)
			throw new Error(
				`Action id for "${name}" is the reserved back id "${BACK_ACTION_ID}"`,
			)

		if (fromId(id) >= cursor)
			throw new Error(
				`Action id "${id}" for "${name}" is at or beyond next ("${lockfile.next}")`,
			)
	})
}

export function serializeLockfile(lockfile: ActionIdLockfile): string {
	const sorted = Object.entries(lockfile.ids)
		.sort(([left], [right]) => left.localeCompare(right))
		.reduce<Record<string, string>>((acc, [name, id]) => {
			acc[name] = id

			return acc
		}, {})

	return `${JSON.stringify({ ids: sorted, next: lockfile.next }, null, '\t')}\n`
}

function isStringRecord(value: unknown): value is Record<string, string> {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		Object.values(value).every((entry) => typeof entry === 'string')
	)
}

export function toLockfile(parsed: unknown): ActionIdLockfile {
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
		throw new Error('Action id lockfile must be a JSON object')

	const { ids, next } = parsed as { ids?: unknown; next?: unknown }

	if (!isStringRecord(ids))
		throw new Error(
			'Action id lockfile "ids" must map action names to strings',
		)

	if (typeof next !== 'string')
		throw new Error('Action id lockfile "next" must be a string')

	return { ids, next }
}

export function parseLockfile(raw: string | undefined): ActionIdLockfile {
	if (raw === undefined) return { ids: {}, next: FIRST_ID }

	return toLockfile(JSON.parse(raw))
}
