import { AvailableStakeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { configName, resolveConfig } from '../../utils/stake'
import { buildChooseChainPage } from '../choose-chain-token'

export class ZapChooseChainPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
	}): PageContent {
		const { availableStake, ticketCount } = args
		const config = resolveConfig(availableStake)

		return buildChooseChainPage({
			lines: [
				buyTicketsBreadcrumb(configName(config)),
				'',
				`Ticket count: ${ticketCount}`,
				'',
				'Choose a chain to pay from:',
			],
			chainActionId: actionIds.openZapChooseToken,
			chainPayload: (chainIndex) => chainIndex.toString(),
			nav: {
				parent: actionIds.openChooseStake,
				home: actionIds.openHome,
			},
		})
	}
}
