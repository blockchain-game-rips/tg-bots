import {
	ActionContext,
	ActionDef,
	HandlerResult,
	noPayload as _noPayload,
	withPayload as _withPayload,
} from '@rips/grammy-kit'
import { Flow } from './flows'

export { ActionDef }

type Result = Promise<HandlerResult<Flow>> | HandlerResult<Flow>

export function noPayload(
	handler: (actionContext: ActionContext<Flow>) => Result,
): ActionDef<void> {
	return _noPayload(handler)
}

export function withPayload<P>(
	encode: (value: P) => string,
	decode: (raw: string) => P,
	handler: (actionContext: ActionContext<Flow>, payload: P) => Result,
): ActionDef<P> {
	return _withPayload({ encode, decode }, handler)
}
