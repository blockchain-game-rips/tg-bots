import { Effect, SessionData } from './types'

export type ActionDef<P> = {
	encode: (value: P) => string
	decode: (raw: string) => P
	handler: (session: SessionData, payload: P) => Promise<Effect> | Effect
}

export function noPayload(
	handler: (session: SessionData) => Promise<Effect> | Effect,
): ActionDef<void> {
	return {
		encode: () => '',
		decode: () => undefined as void,
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
