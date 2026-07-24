import { AvailablePresetDto, CurrencyDto } from '@rips/api-client'
import { configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseTokenPage } from '../choose-chain-token'

export const ZapChooseTokenPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		currencies: CurrencyDto[]
	}): PageContent {
		const { availablePreset, currencies } = args
		const config = resolveConfig(availablePreset)

		const srcCurrency = currencies[0]

		if (srcCurrency === undefined) throw new Error('No currencies provided')

		const srcChainName = chainToName(srcCurrency.chainAddress.chain)

		return buildChooseTokenPage({
			lines: [
				buyEntriesBreadcrumb(configName(config), srcChainName),
				'',
				'🌉 Enter from another chain',
				'',
				`From: ${srcChainName}`,
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
