import { joinLines } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import { buildChainKeyboard } from '../../utils/chain-currency-keyboard'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'

export const DepositChooseChainPage = {
	render(args: { chains: Chain[] }): PageContent {
		const message = joinLines([depositBreadcrumb(), '', 'Select a chain:'])

		const keyboard = buildChainKeyboard(
			args.chains,
			actionIds.openDepositChooseCurrency,
		).appendNavButtons()

		return { message, keyboard }
	},
}
