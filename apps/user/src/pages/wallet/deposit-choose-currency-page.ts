import { CurrencyDtoOutput } from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildCurrencyKeyboard } from '../../utils/chain-currency-keyboard'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'

export const DepositChooseCurrencyPage = {
	render(args: {
		chain: Chain
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const message = joinLines([
			depositBreadcrumb(chainToName(args.chain)),
			'',
			'Select a token:',
		])

		const keyboard = buildCurrencyKeyboard(
			args.currencies,
			actionIds.openDepositAddress,
		).appendNavButtons()

		return { message, keyboard }
	},
}
