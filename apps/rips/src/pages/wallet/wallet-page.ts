import { CurrencyAmountDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formattedAmountWithUsd } from '../../utils/currency'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class WalletPage {
	static render(
		balance: CurrencyAmountDto,
		userEvmAddress: string,
	): PageContent {
		let message = ''
		message += `Balance: ${formattedAmountWithUsd(balance)}`
		message += '\n\n'
		message += `Deposit ETH on Base to this address: <code>${userEvmAddress}</code>`

		const keyboard = addNav(
			keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.showWallet }],
				[{ label: 'Withdraw', actionId: actionIds.showWithdraw }],
				[
					{
						label: 'Swap',
						actionId: actionIds.showSwapChooseChain,
					},
				],
			]),
			{ home: actionIds.showHome, parent: actionIds.showHome },
		)

		return { message, keyboard }
	}
}
