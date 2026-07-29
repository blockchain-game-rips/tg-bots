import { CurrencyAmountDto } from '@rips/api-client'
import {
	addNav,
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard, InputFile } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { chainToName, currencyToChain } from '../../utils/chain'
import { depositBreadcrumb } from '../../utils/display/breadcrumb'

interface RenderArgs {
	balance: CurrencyAmountDto
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

		addNav(keyboard, {
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
