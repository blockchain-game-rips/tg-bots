import { ActionId } from '../types'
import { ActionDef } from './action-def'

const ID_RADIX = 36

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

function toActionId(index: number): string {
	return index.toString(ID_RADIX)
}

/**
 * Names every action of an app and the payload its button carries. Imports
 * nothing from handlers or pages, so pages can build buttons without pulling
 * the registry — and through it every handler — in behind them.
 */
export function declareActions<D extends Record<string, ActionId<unknown>>>(
	declarations: D,
): { [K in keyof D]: ActionId<PayloadOfId<D[K]>> } {
	const result: Record<string, string> = {}

	Object.keys(declarations).forEach((name, index) => {
		result[name] = toActionId(index)
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
