import { CurrencyAmountDtoOutput } from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'
import {
	TransactionOutcome,
	transactionOutcomeLines,
} from '../../utils/display/transaction-outcome'

export interface EnterSuccessArgs {
	entryPrice: CurrencyAmountDtoOutput
	entryCap: number
	filledEntries: number
	ripId: number
	entryCount: number
	transactions: TransactionOutcome
}

export const EnterSuccessPage = {
	render(args: EnterSuccessArgs): PageContent {
		const { entryPrice, entryCap, filledEntries, ripId, entryCount } = args

		const lines: Line[] = [
			enterBreadcrumb(formatAmountWithUsd(entryPrice)),
			'',
			'✅ Entry confirmed',
			'',
			`Rip: #${ripId.toString()}`,
			`Entries: ${entryCount.toString()}`,
			entryTotalLine(entryPrice, entryCount),
			'',
			'Status:',
			statusLine(filledEntries, entryCap),
			'',
			...transactionOutcomeLines(args.transactions),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(ripId),
		}
	},
}

function entryTotalLine(
	entryPrice: CurrencyAmountDtoOutput,
	entryCount: number,
): string {
	const total = BigInt(entryCount) * BigInt(entryPrice.amount)

	const formatted = formatAmountWithUsd({
		amount: total.toString(),
		currency: entryPrice.currency,
	})

	return `Entry total: ${formatted}`
}

// Compared with >= rather than ===: entryCap comes from a config that may be
// stale, while filledEntries is a lower bound taken from the fresh purchase
// response. A cap raised mid-purchase would otherwise read as "not filled".
function statusLine(filledEntries: number, entryCap: number): string {
	if (filledEntries >= entryCap) return 'Rip filled — completing results.'

	return 'Waiting for Rip to fill.'
}

function buildKeyboard(ripId: number): InlineKeyboard {
	return new InlineKeyboard()
		.text(
			'View Rip Status',
			buildActionData(actionIds.openRipStatus, ripId),
		)
		.row()
		.text(
			'Enter Again',
			buildActionData(actionIds.openChoosePreset, undefined),
		)
		.row()
		.text('Open Pulls', buildActionData(actionIds.openOpenPulls, undefined))
		.row()
		.appendHomeButton()
}
