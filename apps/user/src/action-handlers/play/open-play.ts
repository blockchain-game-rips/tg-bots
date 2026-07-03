import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { PlayPage } from '../../pages/play/play-page'
import { EffectType } from '../../types'

export const openPlay: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: { type: EffectType.EDIT, page: PlayPage.render() },
}))
