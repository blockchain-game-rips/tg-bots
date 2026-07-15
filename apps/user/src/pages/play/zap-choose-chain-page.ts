import { AvailablePresetDto } from '@rips/api-client'
import { configName, resolveConfig } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'
import { buildChooseChainPage } from '../choose-chain-token'

export const ZapChooseChainPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
	}): PageContent {
		const { availablePreset, entryCount } = args
		const config = resolveConfig(availablePreset)

		return buildChooseChainPage({
			lines: [
				buyEntriesBreadcrumb(configName(config)),
				'',
				`Entry count: ${entryCount.toString()}`,
				'',
				'Choose a chain to pay from:',
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
