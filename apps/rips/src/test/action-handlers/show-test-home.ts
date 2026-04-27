import { TestHomePage } from '../pages/test-home-page'
import { Effect, EffectType, SessionData } from '../types'

export function showTestHome(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return { type: EffectType.EDIT, page: TestHomePage.render() }
}
