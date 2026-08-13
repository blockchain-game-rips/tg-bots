import { CurrencyDtoOutput } from '@rips/api-client'
import { joinLines } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { buildCurrencyKeyboard } from '../../utils/chain-currency-keyboard'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

export const WithdrawChooseCurrencyPage = {
	render(args: {
		chain: Chain
		currencies: CurrencyDtoOutput[]
	}): PageContent {
		const message = joinLines([
			withdrawBreadcrumb(chainToName(args.chain)),
			'',
			'Choose token to withdraw',
		])

		const keyboard = buildCurrencyKeyboard(
			args.currencies,
			actionIds.openWithdrawFromCurrency,
		).appendNavButtons()

		return { message, keyboard }
	},
}
