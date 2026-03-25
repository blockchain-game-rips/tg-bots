import { Filter } from 'grammy'
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
		const revealed = await revealTicketPrizes(telegramId, revealAll)
		const unrevealed = await getUnrevealedPrizes(telegramId)
		const revealedPrizesPage = RevealPrizesPage.render(unrevealed, revealed)

		await editMessage(ctx, revealedPrizesPage)

		return
	}

	const prizes = await getUnrevealedPrizes(telegramId)
	const revealPrizesPage = RevealPrizesPage.render(prizes)

	await editMessage(ctx, revealPrizesPage)
}
