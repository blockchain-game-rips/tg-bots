import { Filter } from 'grammy'
import { ripsControllerGetStakes } from '../../../../generated/api-client'
import { BuyChooseStakePage } from '../../../pages/content/play/buy-choose-stake-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleBuyChooseStakePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const { data } = await ripsControllerGetStakes({ throwOnError: true })

	await editMessage(ctx, BuyChooseStakePage.render(data.availableStakes))
}
