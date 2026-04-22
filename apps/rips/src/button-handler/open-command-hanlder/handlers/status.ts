import { Filter } from 'grammy'
import {
	ripsControllerGetOngoingRounds,
	usersControllerGetUser,
} from '../../../../generated/api-client'
import { EIP155_NAMESPACE } from '../../../constants'
import { StatusPage } from '../../../pages/content/status-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleStatusPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	const [{ data: roundsData }, { data: user }] = await Promise.all([
		ripsControllerGetOngoingRounds({ throwOnError: true }),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	if (userEvmAddress === undefined) {
		throw new Error('User has no EVM wallet')
	}

	await editMessage(ctx, StatusPage.render(roundsData.rounds, userEvmAddress))
}
