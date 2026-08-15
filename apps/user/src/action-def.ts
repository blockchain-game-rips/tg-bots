import {
	ActionContext,
	ActionDef,
	HandlerResult,
	PayloadCodec,
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
	codec: PayloadCodec<P>,
	handler: (actionContext: ActionContext<Flow>, payload: P) => Result,
): ActionDef<P> {
	return _withPayload(codec, handler)
}
