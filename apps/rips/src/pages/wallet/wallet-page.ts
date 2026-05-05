import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/currency'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

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

		const keyboard = addNav(
			keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openWallet }],
				[
					{
						label: 'All Balances',
						actionId: actionIds.openAllBalances,
					},
				],
				[{ label: 'Withdraw', actionId: actionIds.openWithdraw }],
				[{ label: 'Swap', actionId: actionIds.openSwapChooseChain }],
			]),
			{ home: actionIds.openHome, parent: actionIds.openHome },
		)

		return { message: lines.join('\n'), keyboard }
	}
}
