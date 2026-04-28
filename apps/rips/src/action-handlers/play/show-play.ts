import { PlayPage } from '../../pages/content/play/play-page'
import { Effect, EffectType, SessionData } from '../../types'

export function showPlay(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return { type: EffectType.EDIT, page: PlayPage.render() }
}
