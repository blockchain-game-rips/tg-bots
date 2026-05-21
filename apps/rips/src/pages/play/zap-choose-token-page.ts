import { AvailableStakeDto, CurrencyDto } from '@rips/api-client'
import { buyTicketsBreadcrumb, configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export const ZapChooseTokenPage = {
	render(args: {
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
				`Ticket count: ${ticketCount.toString()}`,
				'',
				'Choose a token to pay with:',
			],
			currencies,
			tokenActionId: actionIds.openZapConfirm,
			tokenPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openZapChooseChain,
				home: actionIds.openHome,
			},
		})
	},
}
