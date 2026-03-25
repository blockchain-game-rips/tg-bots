import { Filter } from 'grammy'
import { getUser } from '../../../api/endpoints/users'
import { getBalance } from '../../../api/endpoints/wallets'
import { EIP155_NAMESPACE } from '../../../constants'
import { WalletPage } from '../../../pages/content/wallet-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleWalletPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	const [balance, user] = await Promise.all([
		getBalance(telegramId),
		getUser(telegramId),
	])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	const walletPage = WalletPage.render(balance, userEvmAddress)

	await editMessage(ctx, walletPage)
}
