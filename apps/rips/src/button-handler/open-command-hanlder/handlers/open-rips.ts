import { Filter } from 'grammy'
import { ripsControllerGetPrizes } from '../../../../generated/api-client'
import { RevealPrizesPage } from '../../../pages/content/reveal-prizes-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleOpenRipsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const telegramId = String(ctx.from.id)

	const { data } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
		throwOnError: true,
	})

	const unrevealedPrizes = data.prizes.filter((p) => !p.revealed)

	await editMessage(ctx, RevealPrizesPage.render([], unrevealedPrizes))
}
