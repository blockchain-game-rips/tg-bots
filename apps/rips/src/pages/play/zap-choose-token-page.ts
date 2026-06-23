import { AvailablePresetDto, CurrencyDto } from '@rips/api-client'
import { buyEntriesBreadcrumb, configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import {
	buildChooseTokenPage,
	chainBreadcrumbSegment,
} from '../choose-chain-token'

export const ZapChooseTokenPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		currencies: CurrencyDto[]
	}): PageContent {
		const { availablePreset, entryCount, currencies } = args
		const config = resolveConfig(availablePreset)

		return buildChooseTokenPage({
			lines: [
				buyEntriesBreadcrumb(
					configName(config),
					chainBreadcrumbSegment(currencies),
				),
				'',
				`Entry count: ${entryCount.toString()}`,
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
