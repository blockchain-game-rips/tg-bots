import { FlowBase } from '../session/session-utils'
import { HandlerResult } from '../types'

export type ActionContext<F extends FlowBase | null = any> = {
	telegramId: number
	flow: F
}

export interface PayloadCodec<P> {
	encode: (value: P) => string
	decode: (raw: string) => P
}

export interface ActionDef<P> {
	encode: (value: P) => string
	decode: (raw: string) => P
	handler: (
		actionContext: ActionContext,
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
		actionContext: ActionContext<F>,
	) => Promise<HandlerResult<F>> | HandlerResult<F>,
): ActionDef<void> {
	return {
		encode: () => '',
		decode: (): void => undefined,
		handler: (actionContext) => handler(actionContext as ActionContext<F>),
	}
}

export function withPayload<P, F extends FlowBase | null = FlowBase | null>(
	codec: PayloadCodec<P>,
	handler: (
		actionContext: ActionContext<F>,
		payload: P,
	) => Promise<HandlerResult<F>> | HandlerResult<F>,
): ActionDef<P> {
	return {
		encode: codec.encode,
		decode: codec.decode,
		handler: (actionContext, payload) =>
			handler(actionContext as ActionContext<F>, payload),
	}
}
