import { Filter } from 'grammy'
import { usersControllerGetUser } from '../../../../generated/api-client'
import { EIP155_NAMESPACE } from '../../../constants'
import { WalletPage } from '../../../pages/content/wallet/wallet-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'
import { fetchNativeBalance } from '../../../utils/units'

export async function handleWalletPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const telegramId = String(ctx.from.id)

	const [balance, { data: user }] = await Promise.all([
		fetchNativeBalance(telegramId),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	await editMessage(ctx, WalletPage.render(balance, userEvmAddress))
}
