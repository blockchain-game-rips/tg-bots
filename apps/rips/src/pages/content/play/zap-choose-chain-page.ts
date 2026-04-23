import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { SUPPORTED_CHAINS } from '../../../constants'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav, configName, getConfig } from '../../utils'

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
			keyboard.text(
				chain.name,
				buildCommand({
					pageId: pageIds.zapChooseToken,
					type: 'open',
					payloads: [chainIndex.toString()],
				}),
			)
			keyboard.row()
		})

		addNav(keyboard, {
			parent: pageIds.insufficientFunds,
			home: pageIds.home,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
