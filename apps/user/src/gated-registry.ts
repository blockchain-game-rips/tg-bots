import {
	ActionContext,
	ActionDeclarations,
	ActionRegistryFor,
	AnyHandlerResult,
} from '@rips/grammy-kit'

/**
 * Decides whether an action may run. `undefined` proceeds; any result replaces
 * the handler's own and is indistinguishable to the effect executor, so the
 * check — not the wrapper — owns which screen a refusal shows.
 */
export type EligibilityCheck = (
	actionContext: ActionContext,
) => Promise<AnyHandlerResult | undefined>

/**
 * Wraps every entry of a registry so its handler runs only once the check has
 * passed. Deny-by-default is structural rather than declared: an action added
 * later is gated because the wrapper covers the registry, so there is no
 * exception list to forget to update.
 *
 * The wrapping happens before `buildActions` sees the registry, so each entry
 * stays an ordinary `ActionDef` and `grammy-kit` needs no extension point.
 */
export function buildGatedRegistry<D extends ActionDeclarations>(
	registry: ActionRegistryFor<D>,
	check: EligibilityCheck,
): ActionRegistryFor<D> {
	const gated: Record<string, unknown> = {}

	for (const [name, def] of Object.entries(registry)) {
		gated[name] = {
			...def,
			handler: async (actionContext: ActionContext, payload: unknown) => {
				const refusal = await check(actionContext)

				if (refusal !== undefined) return refusal

				return def.handler(actionContext, payload)
			},
		}
	}

	// Every entry keeps the encode/decode pair and handler arity it arrived
	// with, so the name-to-payload relation survives a wrapping the mapped type
	// cannot express.
	return gated as ActionRegistryFor<D>
}
