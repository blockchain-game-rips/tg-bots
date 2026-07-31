import { parseRipId } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toReset } from '../../flows'
import { ViewPullsPage } from '../../pages/play/view-pulls-page'
import { EffectType } from '../../types'
import { fetchRip, fetchRipPayouts } from '../../utils/api/wrappers'

export const openViewPulls: ActionDef<number> = withPayload(
	{
		encode: (ripId) => ripId.toString(),
		decode: (raw) => parseRipId(raw),
	},
	async (session, ripId) => {
		const [rip, payouts] = await Promise.all([
			fetchRip(ripId),
			fetchRipPayouts(session.telegramId, ripId),
		])

		return {
			flow: toReset(),
			effect: {
				type: EffectType.EDIT,
				page: ViewPullsPage.render({ rip, payouts }),
			},
		}
	},
)
