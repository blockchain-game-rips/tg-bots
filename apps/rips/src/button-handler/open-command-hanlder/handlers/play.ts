import { Filter } from 'grammy'
import { ripsControllerGetPrizes } from '../../../../generated/api-client'
import { PlayPage } from '../../../pages/content/play-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handlePlayPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	const { data } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
		throwOnError: true,
	})

	const hasUnrevealedPrizes = data.prizes.some((p) => !p.revealed)

	await editMessage(ctx, PlayPage.render(hasUnrevealedPrizes))
}
