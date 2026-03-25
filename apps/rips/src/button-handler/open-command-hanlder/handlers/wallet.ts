import { Filter } from 'grammy'
import { getBalance } from '../../../api/endpoints/wallets'
import { WalletPage } from '../../../pages/content/wallet-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleWalletPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	await ctx.editMessageText('loading...')

	const balance = await getBalance(telegramId)
	const walletPage = WalletPage.render(balance)

	await editMessage(ctx, walletPage)
}
