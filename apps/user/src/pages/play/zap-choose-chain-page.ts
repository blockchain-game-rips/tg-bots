import { AvailablePresetDto } from '@rips/api-client'
import { configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export const ZapChooseChainPage = {
	render(args: { availablePreset: AvailablePresetDto }): PageContent {
		const { availablePreset } = args
		const config = resolveConfig(availablePreset)

		return buildChooseChainPage({
			lines: [
				buyEntriesBreadcrumb(configName(config)),
				'',
				'🌉 Enter from another chain',
				'',
				'Pay for your entries with funds on another chain.',
				'The bot bridges/swaps and enters the Rip automatically.',
				'',
				'Payouts are credited on Base.',
				'',
				"First, choose a chain — you'll pick a token next.",
			],
			chainActionId: actionIds.openZapChooseToken,
			chainPayload: (chain) => chain,
			nav: {
				parent: actionIds.openChoosePreset,
				home: actionIds.openHome,
			},
		})
	},
}
