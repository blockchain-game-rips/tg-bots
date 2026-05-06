import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav } from '../../utils/keyboard'

export class WalletPage {
	static render(
		balance: CurrencyAmountDto,
		userEvmAddress: string,
	): PageContent {
		const lines = [
			'<b>Wallet</b>',
			'',
			`💰 Balance: ${formatAmountWithUsd(balance)}`,
			'',
			`Deposit address (Base):`,
			`<code>${userEvmAddress}</code>`,
		]

		const keyboard = new InlineKeyboard()
			.text('Update', buildActionData(actionIds.openWallet, undefined))
			.row()
			.text(
				'All Balances',
				buildActionData(actionIds.openAllBalances, undefined),
			)
			.row()
			.text(
				'Withdraw',
				buildActionData(actionIds.openWithdrawChooseChain, undefined),
			)
			.row()
			.text('Swap', buildActionData(actionIds.openSwap, undefined))
			.row()

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
