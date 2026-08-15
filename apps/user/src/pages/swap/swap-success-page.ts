import { CurrencyAmountDtoOutput, TransactionDtoOutput } from '@rips/api-client'
import { joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'
import {
	TransactionOutcome,
	transactionOutcomeLines,
} from '../../utils/display/transaction-outcome'

interface SamechainResult {
	kind: 'samechain'
	amountOut: CurrencyAmountDtoOutput
	transaction: TransactionDtoOutput
}

interface CrosschainResult {
	kind: 'crosschain'
	amountOut: CurrencyAmountDtoOutput
	srcTransaction: TransactionDtoOutput
	dstTransaction: TransactionDtoOutput
}

type SwapSuccessResult = SamechainResult | CrosschainResult

export const SwapSuccessPage = {
	render(result: SwapSuccessResult): PageContent {
		const lines: Line[] = [
			swapBreadcrumb(),
			'',
			'✅ Swap complete',
			'',
			'You received:',
			formatAmountWithUsd(amountOut(result)),
			'',
			...transactionOutcomeLines(toTransactionOutcome(result)),
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendHomeButton(),
		}
	},
}

function amountOut(result: SwapSuccessResult): CurrencyAmountDtoOutput {
	return result.amountOut
}

function toTransactionOutcome(result: SwapSuccessResult): TransactionOutcome {
	if (result.kind === 'samechain') {
		return { kind: 'singleChain', transaction: result.transaction }
	}

	return {
		kind: 'crosschain',
		srcTransaction: result.srcTransaction,
		dstTransaction: result.dstTransaction,
	}
}
