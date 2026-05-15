import { Effect, SessionData } from '../../types'

export interface ActionDef<P> {
	encode: (value: P) => string
	decode: (raw: string) => P
	handler: (session: SessionData, payload: P) => Promise<Effect> | Effect
}

// `any` is required here — ActionDef<P> is invariant in P (P appears in both encode's input
// and decode's output), so neither `unknown` nor `never` can serve as a wildcard.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActionDef = ActionDef<any>

export function noPayload(
	handler: (session: SessionData) => Promise<Effect> | Effect,
): ActionDef<void> {
	return {
		encode: () => '',
		decode: (): void => undefined,
		handler: (session) => handler(session),
	}
}

export function withPayload<P>(
	encode: (value: P) => string,
	decode: (raw: string) => P,
	handler: (session: SessionData, payload: P) => Promise<Effect> | Effect,
): ActionDef<P> {
	return { encode, decode, handler }
}
