import { PayoutDtoOutput, ripsControllerRevealPayouts } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { CardCollection } from '../../domain/card-collection'
import {
	framesAfterOpening,
	OPENING_FRAME,
} from '../../domain/reveal-animation'
import { copiesOwnedAfterReveal, isNewCard } from '../../domain/reveal-summary'
import { Flow, toReset } from '../../flows'
import { RevealSinglePage } from '../../pages/play/reveal-single-page'
import { EffectType, HandlerResult } from '../../types'
import {
	fetchCardCollectionWithCounts,
	fetchRip,
	fetchUnrevealedPayouts,
} from '../../utils/api/wrappers'
import { playFrames } from './reveal-animation-chain'

export const openRevealSingle: ActionDef<void> = noPayload((session) => {
	const { telegramId } = session

	/**
	 * The band depends on the revealed tier, which is unknown until the reveal
	 * returns, so the request runs behind the shared opening frame and the
	 * remaining frames then play at the resolved band's pace.
	 */
	return playFrames([OPENING_FRAME], () => revealSingleFrom(telegramId))
})

/**
 * Reveals one pull and plays out the rest of its tier's animation. Shared with
 * Reveal All, which defers here when only a single pull remains.
 */
export async function revealSingleFrom(
	telegramId: string,
): Promise<HandlerResult<Flow>> {
	// Fetched before revealing: the reveal increments collection counts
	// server-side, making new-vs-duplicate unrecoverable afterwards.
	const { collection, copiesBefore } =
		await fetchCardCollectionWithCounts(telegramId)

	const { data: revealData } = await ripsControllerRevealPayouts({
		headers: { 'x-telegram-id': telegramId },
		body: { revealAll: false },
	})

	const revealedPayout = revealData.payouts[0]

	if (revealedPayout === undefined)
		throw new Error('Revealed payout not found')

	const remainingFrames = framesAfterOpening(revealedPayout.card.tier)

	return playFrames(remainingFrames, () =>
		renderResult(telegramId, revealedPayout, collection, copiesBefore),
	)
}

async function renderResult(
	telegramId: string,
	revealedPayout: PayoutDtoOutput,
	preRevealCollection: CardCollection,
	copiesBefore: Map<number, number>,
): Promise<HandlerResult<Flow>> {
	const [rip, unrevealedPayouts] = await Promise.all([
		fetchRip(revealedPayout.ripId),
		fetchUnrevealedPayouts(telegramId),
	])

	const cardId = revealedPayout.card.id

	const isNew = isNewCard(preRevealCollection, cardId)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: RevealSinglePage.render({
				rip,
				revealedPayout,
				unopenedCount: unrevealedPayouts.length,
				isNew,
				collectionProgress: {
					collected:
						preRevealCollection.totalCollected + (isNew ? 1 : 0),
					total: preRevealCollection.totalCards,
				},
				copiesOwned: copiesOwnedAfterReveal(copiesBefore, cardId),
			}),
		},
	}
}
