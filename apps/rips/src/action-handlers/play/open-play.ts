import { PlayPage } from '../../pages/play/play-page'
import { Effect, EffectType, SessionData } from '../../types'

export function openPlay(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return { type: EffectType.EDIT, page: PlayPage.render() }
}
