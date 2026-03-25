import { Filter } from 'grammy'
import { getMainCurrencyPrice } from '../../../api/endpoints/price'
import {
	getUnrevealedPrizes,
	revealTicketPrizes,
} from '../../../api/endpoints/users'
import {
	REVEAL_ALL_PAYLOAD,
	REVEAL_ONE_PAYLOAD,
	RevealPrizesPage,
} from '../../../pages/content/reveal-prizes-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleRevealPrizesPageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	clearFlow(ctx)

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const action = payloads[0]

	if (action === REVEAL_ONE_PAYLOAD || action === REVEAL_ALL_PAYLOAD) {
		const revealAll = action === REVEAL_ALL_PAYLOAD
		const [revealed, unrevealed, { price }] = await Promise.all([
			revealTicketPrizes(telegramId, revealAll),
			getUnrevealedPrizes(telegramId),
			getMainCurrencyPrice(),
		])
		const revealedPrizesPage = RevealPrizesPage.render(
			unrevealed,
			price,
			revealed,
		)

		await editMessage(ctx, revealedPrizesPage)

		return
	}

	const [prizes, { price }] = await Promise.all([
		getUnrevealedPrizes(telegramId),
		getMainCurrencyPrice(),
	])
	const revealPrizesPage = RevealPrizesPage.render(prizes, price)

	await editMessage(ctx, revealPrizesPage)
}
