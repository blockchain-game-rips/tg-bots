import { Filter } from 'grammy'
import {
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	ripsControllerRevealPrizes,
} from '../../../../generated/api-client'
import {
	REVEAL_ALL_PAYLOAD,
	REVEAL_ONE_PAYLOAD,
	RevealPrizesPage,
} from '../../../pages/content/play/reveal-prizes-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleRevealPrizesPageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	clearFlow(ctx)

	const telegramId = String(ctx.from.id)
	const action = payloads[0]

	if (action === REVEAL_ONE_PAYLOAD || action === REVEAL_ALL_PAYLOAD) {
		const revealAll = action === REVEAL_ALL_PAYLOAD

		const { data: revealData } = await ripsControllerRevealPrizes({
			headers: { 'x-telegram-id': telegramId },
			body: { revealAll },
			throwOnError: true,
		})

		const { data: prizesData } = await ripsControllerGetPrizes({
			headers: { 'x-telegram-id': telegramId },
			throwOnError: true,
		})

		const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)
		const roundIds = [...new Set(revealData.prizes.map((p) => p.roundId))]

		const { data: roundsData } = await ripsControllerGetRounds({
			query: { ids: roundIds },
			throwOnError: true,
		})

		await editMessage(
			ctx,
			RevealPrizesPage.render(
				roundsData.rounds,
				unrevealedPrizes,
				revealData.prizes,
			),
		)

		return
	}

	const { data: prizesData } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
		throwOnError: true,
	})

	const unrevealedPrizes = prizesData.prizes.filter((p) => !p.revealed)

	await editMessage(ctx, RevealPrizesPage.render([], unrevealedPrizes))
}
