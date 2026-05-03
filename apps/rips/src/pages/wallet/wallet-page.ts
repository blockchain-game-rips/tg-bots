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
		let message = ''
		message += `Balance: ${formatAmountWithUsd(balance)}`
		message += '\n\n'
		message += `Deposit ETH on Base to this address: <code>${userEvmAddress}</code>`

		const keyboard = addNav(
			keyboardFromLayout([
				[{ label: 'Update', actionId: actionIds.openWallet }],
				[{ label: 'Withdraw', actionId: actionIds.openWithdraw }],
				[
					{
						label: 'Swap',
						actionId: actionIds.openSwapChooseChain,
					},
				],
			]),
			{ home: actionIds.openHome, parent: actionIds.openHome },
		)

		return { message, keyboard }
	}
}
