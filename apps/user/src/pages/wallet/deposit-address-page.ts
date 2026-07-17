import { CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName } from '../../utils/chain'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'

export const DepositAddressPage = {
	render(balance: CurrencyAmountDto, depositAddress: string): PageContent {
		const { currency } = balance
		const chain = currency.chainAddress.chain
		const chainName = chainToName(chain)

		const lines = [
			depositBreadcrumb(chainName, currency.symbol),
			'',
			`Send ${currency.symbol} on ${chainName} to this address:`,
			`<code>${depositAddress}</code>`,
			'',
			`Balance: ${formatAmountWithUsd(balance)}`,
			'',
			'⚠️ Sending unsupported assets may cause loss of funds.',
		]

		const keyboard = new InlineKeyboard()
			.copyText('Copy Address', depositAddress)
			.row()
			.text(
				'Refresh Balance',
				buildActionData(
					actionIds.openDepositAddress,
					currency.chainAddress,
				),
			)

		addNav(keyboard, {
			parent: actionIds.openDepositChooseToken,
			parentPayload: chain,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
