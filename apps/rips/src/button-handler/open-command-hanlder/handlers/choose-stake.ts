import { Filter } from 'grammy'
import { getStakes } from '../../../api/endpoints/rips'
import { ChooseStakePage } from '../../../pages/content/choose-stake-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleChooseStakePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const stakes = await getStakes()
	const chooseStakePage = ChooseStakePage.render(stakes)

	await editMessage(ctx, chooseStakePage)
}
