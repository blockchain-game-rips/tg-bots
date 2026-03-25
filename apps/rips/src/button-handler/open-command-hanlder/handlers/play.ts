import { Filter } from 'grammy'
import { getUnrevealedPrizes } from '../../../api/endpoints/users'
import { PlayPage } from '../../../pages/content/play-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handlePlayPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const prizes = await getUnrevealedPrizes(telegramId)
	const playPage = PlayPage.render(prizes.length > 0)

	await editMessage(ctx, playPage)
}
