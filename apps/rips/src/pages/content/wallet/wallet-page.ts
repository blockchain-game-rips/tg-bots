import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formatUnits, toUsd } from '../../../utils/units'
import { addNav, composeMarkup } from '../../utils'

export class WalletPage {
	static render(
		balance: CurrencyAmountDto,
		userEvmAddress: string,
	): PageContent {
		const amount = formatUnits(
			BigInt(balance.amount),
			balance.currency.decimals,
		)

		let message = ''
		message += `Balance: ${amount} ${balance.currency.symbol} ${toUsd(balance)}`
		message += '\n\n'
		message += `Deposit ETH on Base to this address: <code>${userEvmAddress}</code>`

		const keyboard = addNav(
			new InlineKeyboard(
				composeMarkup([
					[{ label: 'Update', actionId: actionIds.showWallet }],
					[{ label: 'Withdraw', actionId: actionIds.showWithdraw }],
					[
						{
							label: 'Swap',
							actionId: actionIds.showSwapChooseChain,
						},
					],
				]),
			),
			{ home: actionIds.showHome, parent: actionIds.showHome },
		)

		return { message, keyboard }
	}
}
