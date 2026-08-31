import { ActionId } from '../types'
import { ActionDef } from './action-def'
import {
	assertLockfileCovers,
	type ActionIdLockfile,
} from './action-ids-lockfile'

/**
 * Declares the payload an action's buttons carry. Carries no value — the type
 * parameter is the whole point, and the registry is checked against it.
 */
export function withPayloadId<P>(): ActionId<P> {
	return '' as ActionId<P>
}

/** Declares an action whose buttons carry nothing beyond the id itself. */
export function noPayloadId(): ActionId {
	return '' as ActionId
}

export type ActionDeclarations = Record<string, ActionId<unknown>>

export type PayloadOfId<I> = I extends ActionId<infer P> ? P : never

/**
 * Resolves each declared action to the id its lockfile allocated. Imports
 * nothing from handlers or pages, so pages can build buttons without pulling
 * the registry — and through it every handler — in behind them.
 */
export function declareActions<D extends ActionDeclarations>(
	lockfile: ActionIdLockfile,
	declarations: D,
): { [K in keyof D]: ActionId<PayloadOfId<D[K]>> } {
	const names = Object.keys(declarations)

	assertLockfileCovers(lockfile, names)

	const result: Record<string, string> = {}

	names.forEach((name) => {
		const id = lockfile.ids[name]

		if (id === undefined)
			throw new Error(`Action "${name}" has no id in the lockfile`)

		result[name] = id
	})

	// The ids are branded strings with no runtime form, so the payload types
	// each name carries can only be restored by assertion.
	return result as { [K in keyof D]: ActionId<PayloadOfId<D[K]>> }
}

/**
 * The handler table an app must supply for a set of declarations: every
 * declared action, each typed to the payload its declaration names. A missing
 * handler, a stray one, and a diverging payload type are all compile errors.
 */
export type ActionRegistryFor<D extends ActionDeclarations> = {
	[K in keyof D]: ActionDef<PayloadOfId<D[K]>>
}
