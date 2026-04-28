import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { addNav } from '../../utils'

export class WithdrawInsufficientFundsPage {
	static render(args: {
		chainIndex: number
		currencyIndex: number
		amount: CurrencyAmountDto
		balance: CurrencyAmountDto
		userEvmAddress: string
	}): PageContent {
		const { chainIndex, currencyIndex, amount, balance, userEvmAddress } =
			args
		const chain = SUPPORTED_CHAINS[chainIndex]
		const currency = SUPPORTED_CURRENCIES[currencyIndex]

		const lines = [
			`Chain: ${chain.name}`,
			`Token: ${currency.symbol}`,
			'',
			`⚠️ Not enough funds.`,
			`Required: ${formattedAmountWithUsd(amount)}`,
			`Your balance: ${formattedAmountWithUsd(balance)}`,
			'',
			`Address: ${userEvmAddress}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Choose amount',
			actionIds.showWithdrawChooseAmount,
		)

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseToken,
			home: actionIds.showHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
