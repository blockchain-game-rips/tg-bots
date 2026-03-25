import { Filter } from 'grammy'
import { getUnrevealedPrizes } from '../../../api/endpoints/users'
import { RevealPrizesPage } from '../../../pages/content/reveal-prizes-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleOpenRipsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const prizes = await getUnrevealedPrizes(telegramId)
	const revealPrizesPage = RevealPrizesPage.render(prizes)

	await editMessage(ctx, revealPrizesPage)
}
