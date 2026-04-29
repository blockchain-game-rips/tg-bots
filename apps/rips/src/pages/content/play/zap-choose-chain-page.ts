import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { buildActionData } from '../../../utils/action-data'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'
import { configName, resolveConfig } from '../../../utils/stake'

export class ZapChooseChainPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
	}): PageContent {
		const { availableStake, ticketCount } = args
		const config = resolveConfig(availableStake)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			'Choose a chain to pay from:',
		]

		const keyboard = new InlineKeyboard()

		SUPPORTED_CHAINS.forEach((chain, chainIndex) => {
			keyboard
				.text(
					chain.name,
					buildActionData(
						actionIds.showZapChooseToken,
						chainIndex.toString(),
					),
				)
				.row()
		})

		addNav(keyboard, {
			parent: actionIds.showChooseStake,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
