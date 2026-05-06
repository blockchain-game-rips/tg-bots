import { AvailableStakeDto, CurrencyDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyTicketsBreadcrumb } from '../../utils/breadcrumb'
import { configName, resolveConfig } from '../../utils/stake'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export class ZapChooseTokenPage {
	static render(args: {
		availableStake: AvailableStakeDto
		ticketCount: number
		currencies: CurrencyDto[]
	}): PageContent {
		const { availableStake, ticketCount, currencies } = args
		const config = resolveConfig(availableStake)

		return buildChooseTokenPage({
			lines: [
				buyTicketsBreadcrumb(
					configName(config),
					chainBreadcrumbSegment(currencies),
				),
				'',
				`Ticket count: ${ticketCount}`,
				'',
				'Choose a token to pay with:',
			],
			currencies,
			tokenActionId: actionIds.openZapConfirm,
			tokenPayload: (currencyIndex) => currencyIndex,
			nav: {
				parent: actionIds.openZapChooseChain,
				home: actionIds.openHome,
			},
		})
	}
}
