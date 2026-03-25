import { Filter } from 'grammy'
import { getMainCurrencyPrice } from '../../../api/endpoints/price'
import { getStakes } from '../../../api/endpoints/rips'
import { ChooseStakePage } from '../../../pages/content/choose-stake-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleChooseStakePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const [stakes, { price }] = await Promise.all([
		getStakes(),
		getMainCurrencyPrice(),
	])
	const chooseStakePage = ChooseStakePage.render(stakes, price)

	await editMessage(ctx, chooseStakePage)
}
