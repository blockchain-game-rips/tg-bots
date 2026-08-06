import { AvailablePresetDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseCurrencyPage } from '../choose-chain-currency'

export const ZapChooseTokenPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const { availablePreset, currencies } = args
		const config = resolveConfig(availablePreset)

		const srcCurrency = currencies[0]

		if (srcCurrency === undefined) throw new Error('No currencies provided')

		const srcChainName = currencyToChainName(srcCurrency)

		return buildChooseCurrencyPage({
			lines: [
				enterBreadcrumb(configName(config), srcChainName),
				'',
				'🌉 Enter from another chain',
				'',
				`From: ${srcChainName}`,
				'',
				'Choose a token to pay with:',
			],
			currencies,
			currencyActionId: actionIds.openZapConfirm,
			currencyPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openZapChooseChain,
				home: actionIds.openHome,
			},
		})
	},
}
