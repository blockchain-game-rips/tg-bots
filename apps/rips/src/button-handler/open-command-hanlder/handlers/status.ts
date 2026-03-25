import { Filter } from 'grammy'
import { getRounds } from '../../../api/endpoints/rips'
import { getUser } from '../../../api/endpoints/users'
import { EIP155_NAMESPACE } from '../../../constants'
import { StatusPage } from '../../../pages/content/status-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleStatusPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	const [rounds, user] = await Promise.all([getRounds(), getUser(telegramId)])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	if (userEvmAddress === undefined) {
		throw new Error('User has no EVM wallet')
	}

	const statusPage = StatusPage.render(rounds, userEvmAddress)

	await editMessage(ctx, statusPage)
}
