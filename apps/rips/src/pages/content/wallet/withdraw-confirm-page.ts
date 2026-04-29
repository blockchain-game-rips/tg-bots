import { InlineKeyboard } from 'grammy'
import { CurrencyAmountDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../../constants'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/currency'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'

export class WithdrawConfirmPage {
	static render(args: {
		chainIndex: number
		currencyIndex: number
		amount: CurrencyAmountDto
		networkFee: CurrencyAmountDto
		receiverAddress: string
	}): PageContent {
		const {
			chainIndex,
			currencyIndex,
			amount,
			networkFee,
			receiverAddress,
		} = args
		const chain = SUPPORTED_CHAINS[chainIndex]
		const currency = SUPPORTED_CURRENCIES[currencyIndex]

		const lines = [
			`Chain: ${chain.name}`,
			`Token: ${currency.symbol}`,
			'',
			`Amount: ${formattedAmountWithUsd(amount)}`,
			`Recipient: <code>${receiverAddress}</code>`,
			'',
			`Network fee: ${formattedAmountWithUsd(networkFee)}`,
			'',
			'Confirm to proceed with withdrawal',
		]

		const keyboard = new InlineKeyboard().text(
			'Confirm',
			actionIds.executeWithdrawNewChain,
		)

		addNav(keyboard, {
			parent: actionIds.showWithdrawChooseReceiver,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
