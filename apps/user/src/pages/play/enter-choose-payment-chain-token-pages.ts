import { AvailablePresetDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'
import {
	buildChooseChainPage,
	buildChooseCurrencyPage,
} from '../choose-chain-currency'

const ANOTHER_CHAIN_TITLE = '🌉 Pay from another chain'

export const EnterChoosePaymentChainPage = {
	render(args: { availablePreset: AvailablePresetDtoOutput }): PageContent {
		const { availablePreset } = args
		const config = resolveConfig(availablePreset)

		return buildChooseChainPage({
			lines: [
				enterBreadcrumb(configName(config)),
				'',
				ANOTHER_CHAIN_TITLE,
				'',
				'Pay for your entries with funds on another chain.',
				'The bot moves them over and enters the Rip automatically.',
				'',
				'Payouts are credited on Base.',
				'',
				"First, choose a chain — you'll pick a token next.",
			],
			chainActionId: actionIds.openEnterChoosePaymentToken,
			chainPayload: (chain) => chain,
			nav: {
				parent: actionIds.openEnterPaymentOptions,
				home: actionIds.openHome,
			},
		})
	},
}

export const EnterChoosePaymentTokenPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const { availablePreset, currencies } = args
		const config = resolveConfig(availablePreset)

		const firstCurrency = currencies[0]

		if (firstCurrency === undefined)
			throw new Error('No currencies provided')

		const chainName = currencyToChainName(firstCurrency)

		return buildChooseCurrencyPage({
			lines: [
				enterBreadcrumb(configName(config), chainName),
				'',
				ANOTHER_CHAIN_TITLE,
				'',
				`From: ${chainName}`,
				'',
				'Choose a token to pay with:',
			],
			currencies,
			currencyActionId: actionIds.openZapConfirm,
			currencyPayload: (currency) => currency.chainAddress,
			nav: {
				parent: actionIds.openEnterChoosePaymentChain,
				home: actionIds.openHome,
			},
		})
	},
}
