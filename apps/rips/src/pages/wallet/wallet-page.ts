import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/format/currency'

export const WalletPage = {
	render(balance: CurrencyAmountDto, userEvmAddress: string): PageContent {
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
	},
}
