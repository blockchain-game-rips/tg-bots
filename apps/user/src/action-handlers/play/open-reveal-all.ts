import { ripsControllerRevealPayouts } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import {
	batchFramesAfterOpening,
	OPENING_FRAME,
} from '../../domain/reveal-animation'
import { buildRevealSummary } from '../../domain/reveal-summary'
import { Flow, toReset } from '../../flows'
import { RevealAllPage } from '../../pages/play/reveal-all-page'
import { EffectType, HandlerResult } from '../../types'
import {
	fetchCardCollection,
	fetchRip,
	fetchUnrevealedPayouts,
} from '../../utils/api/wrappers'
import { revealSingleFrom } from './open-reveal-single'
import { playFrames } from './reveal-animation-chain'

const SINGLE_PULL = 1

/**
 * Opens on the neutral shared frame rather than a batch frame, so the count can
 * decide the path before any batch-specific copy is shown.
 */
export const openRevealAll: ActionDef<void> = noPayload((session) => {
	const { telegramId } = session

	return playFrames([OPENING_FRAME], () => revealBatch(telegramId))
})

/**
 * With one pull left this defers to the single-reveal path: a fixed batch
 * animation for one card is absurd, and the result page is the better screen
 * for a single result.
 */
async function revealBatch(telegramId: string): Promise<HandlerResult<Flow>> {
	const unopenedBefore = await fetchUnrevealedPayouts(telegramId)

	if (unopenedBefore.length === SINGLE_PULL) {
		return revealSingleFrom(telegramId)
	}

	// Fetched before revealing: the reveal increments collection counts
	// server-side, making new-vs-duplicate unrecoverable afterwards.
	const preRevealCollection = await fetchCardCollection(telegramId)

	const { data: revealData } = await ripsControllerRevealPayouts({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: true },
	})

	return playFrames(batchFramesAfterOpening(), async () => {
		const summary = buildRevealSummary(
			preRevealCollection,
			revealData.payouts,
		)

		const firstPayout = revealData.payouts[0]

		if (firstPayout === undefined)
			throw new Error('No payouts were revealed')

		const rip = await fetchRip(firstPayout.ripId)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: RevealAllPage.render({
					currency: rip.currency,
					summary,
				}),
				history: { kind: 'page' },
			},
		}
	})
}
