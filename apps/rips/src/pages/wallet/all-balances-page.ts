import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class AllBalancesPage {
	static render(balances: CurrencyAmountDto[]): PageContent {
		const balanceLines = balances.map(
			(b) => `• ${b.currency.symbol}: ${formatAmountWithUsd(b)}`,
		)

		const lines = ['<b>All Balances</b>', '', ...balanceLines]

		const keyboard = addNav(keyboardFromLayout([]), {
			home: actionIds.openHome,
			parent: actionIds.openWallet,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
