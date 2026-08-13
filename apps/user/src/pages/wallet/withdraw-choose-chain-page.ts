import { joinLines } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildChainKeyboard } from '../../utils/chain-currency-keyboard'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawChooseChainPage = {
	render(args: { chains: Chain[] }): PageContent {
		const message = joinLines([
			withdrawBreadcrumb(),
			'',
			'Choose the chain you want to withdraw from:',
		])

		const keyboard = buildChainKeyboard(
			args.chains,
			actionIds.openWithdrawChooseCurrency,
		).appendNavButtons()

		return { message, keyboard }
	},
}
