import { Effect, SessionData } from '../types'
import { ErrorToRender } from '../utils/error-to-render'

export function notImplemented(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	throw new ErrorToRender('This feature is not yet available')
}
