import { Filter } from 'grammy'
import { enterWithdrawPage } from '../../../flows/withdraw'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'
import { getCurrentPage } from '../../utils'

export async function handleWithdrawPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	const withdrawPage = await enterWithdrawPage(ctx, {
		pageContent: currentPage,
		messageId,
	})

	await editMessage(ctx, withdrawPage)
}
