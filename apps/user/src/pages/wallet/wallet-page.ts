import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

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
			.text(
				'Bridge / Swap',
				buildActionData(actionIds.openSwapChooseSrcChain, undefined),
			)
			.row()
			.text(
				'Export Private Key',
				buildActionData(actionIds.openExportKeyWarning, undefined),
			)
			.row()

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
