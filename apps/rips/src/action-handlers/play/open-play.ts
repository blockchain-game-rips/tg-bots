import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { PlayPage } from '../../pages/play/play-page'
import { EffectType } from '../../types'

export const openPlay: ActionDef<void> = noPayload(() => ({
	type: EffectType.EDIT,
	page: PlayPage.render(),
}))
