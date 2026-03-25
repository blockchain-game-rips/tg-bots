import { Filter } from 'grammy'
import { getStakes } from '../../../api/endpoints/rips'
import { ChooseStakePage } from '../../../pages/content/choose-stake-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleChooseStakePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const stakes = await getStakes()
	const chooseStakePage = ChooseStakePage.render(stakes)

	await editMessage(ctx, chooseStakePage)
}
