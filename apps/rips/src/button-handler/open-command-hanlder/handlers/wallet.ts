import { Filter } from 'grammy'
import {
	usersControllerGetUser,
	walletsControllerGetBalances,
} from '../../../../generated/api-client'
import { EIP155_NAMESPACE, NATIVE_ON_BASE } from '../../../constants'
import { WalletPage } from '../../../pages/content/wallet-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'
import { chainAddressToString } from '../../../utils/units'

export async function handleWalletPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const telegramId = String(ctx.from.id)

	const [{ data: balancesData }, { data: user }] = await Promise.all([
		walletsControllerGetBalances({
			headers: { 'x-telegram-id': telegramId },
			query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
			throwOnError: true,
		}),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	const balance = balancesData.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	await editMessage(ctx, WalletPage.render(balance, userEvmAddress))
}
