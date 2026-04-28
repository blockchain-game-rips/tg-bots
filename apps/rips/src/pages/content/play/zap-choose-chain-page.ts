import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { addNav, buildActionData, configName, getConfig } from '../../utils'

export class ZapChooseChainPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
	}): PageContent {
		const { availableStake, ticketCount } = args
		const config = getConfig(availableStake)

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

		return { message: lines.join('\n'), keyboard }
	}
}
