import { CurrencyAmountDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard, InputFile } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChain } from '@rips/shared'
import { chainToName } from '../../utils/chain'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'

interface RenderArgs {
	balance: CurrencyAmountDtoOutput
	depositAddress: string
	qr?: InputFile
}

export const DepositAddressPage = {
	render({ balance, depositAddress, qr }: RenderArgs): PageContent {
		const { currency } = balance
		const chain = currencyToChain(currency)
		const chainName = chainToName(chain)

		const lines: Line[] = [
			depositBreadcrumb(chainName, currency.symbol),
			'',
			`Send ${currency.symbol} on ${chainName} to this address:`,
			FormattedString.code(depositAddress),
			'',
			`Balance: ${formatAmountWithUsd(balance)}`,
			'',
			'⚠️ Sending unsupported assets may cause loss of funds.',
		]

		const showingQr = qr !== undefined

		const refreshAction = showingQr
			? actionIds.openDepositAddressQr
			: actionIds.openDepositAddress

		const qrToggle = showingQr
			? {
					label: 'Hide QR',
					action: actionIds.openDepositAddress,
				}
			: {
					label: 'Show QR',
					action: actionIds.openDepositAddressQr,
				}

		const keyboard = new InlineKeyboard()
			.copyText('Copy Address', depositAddress)
			.row()
			.text(
				qrToggle.label,
				buildActionData(qrToggle.action, currency.chainAddress),
			)
			.row()
			.text(
				'Refresh Balance',
				buildActionData(refreshAction, currency.chainAddress),
			)

		keyboard.appendNavButtons({
			parent: actionIds.openDepositChooseCurrency,
			parentPayload: chain,
			home: actionIds.openHome,
		})

		return {
			message: joinLines(lines),
			keyboard,
			photo: qr,
		}
	},
}
