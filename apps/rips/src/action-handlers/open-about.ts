import { ripsControllerGetStakes } from '../../generated/api-client'
import { AboutPage } from '../pages/about/about-page'
import { Effect, EffectType, SessionData } from '../types'

export async function openAbout(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetStakes()

	const configs = data.availableStakes
		.map((s) => s.fillingRound?.config ?? s.stake.currentConfig)
		.filter((c) => c !== null && c !== undefined)

	return { type: EffectType.EDIT, page: AboutPage.render(configs) }
}
