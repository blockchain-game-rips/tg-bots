import { Filter } from 'grammy'
import { ripsControllerGetStakes } from '../../../../generated/api-client'
import { ChooseStakePage } from '../../../pages/content/play/choose-stake-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleChooseStakePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const { data } = await ripsControllerGetStakes({ throwOnError: true })

	await editMessage(ctx, ChooseStakePage.render(data.availableStakes))
}
