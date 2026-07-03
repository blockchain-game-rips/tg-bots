import { applyFlowTransition, FlowBase } from '../session/session-utils'
import { Effect, HandlerResult, SessionData } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySession = SessionData<any>

export interface ActionDef<P> {
	encode: (value: P) => string
	decode: (raw: string) => P
	// Session typed as `any`-based to allow app-specific Flow types in handlers.
	handler: (
		session: AnySession,
		payload: P,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	) => Promise<HandlerResult<any>> | HandlerResult<any>
}

// `any` is required here — ActionDef<P> is invariant in P (P appears in both encode's input
// and decode's output), so neither `unknown` nor `never` can serve as a wildcard.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActionDef = ActionDef<any>

export function noPayload<F extends FlowBase | null = FlowBase | null>(
	handler: (
		session: SessionData<F>,
	) => Promise<HandlerResult<F>> | HandlerResult<F>,
): ActionDef<void> {
	return {
		encode: () => '',
		decode: (): void => undefined,
		handler: (session) => handler(session as SessionData<F>),
	}
}

export function withPayload<P, F extends FlowBase | null = FlowBase | null>(
	encode: (value: P) => string,
	decode: (raw: string) => P,
	handler: (
		session: SessionData<F>,
		payload: P,
	) => Promise<HandlerResult<F>> | HandlerResult<F>,
): ActionDef<P> {
	return {
		encode,
		decode,
		handler: (session, payload) =>
			handler(session as SessionData<F>, payload),
	}
}

export function resolveEffect<F extends FlowBase | null>(
	session: SessionData<F>,
	result: HandlerResult<F>,
): Effect {
	applyFlowTransition(session, result.flow)

	return result.effect
}
