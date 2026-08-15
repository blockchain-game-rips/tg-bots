import { TransactionDtoOutput } from '@rips/api-client'
import { FormattedString, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { chainToName } from '../chain'

interface SingleChainOutcome {
	kind: 'singleChain'
	transaction: TransactionDtoOutput
}

interface CrosschainOutcome {
	kind: 'crosschain'
	srcTransaction: TransactionDtoOutput
	dstTransaction: TransactionDtoOutput
}

export type TransactionOutcome = SingleChainOutcome | CrosschainOutcome

// The source leg is the one the user funded from their own wallet.
function feeTransaction(outcome: TransactionOutcome): TransactionDtoOutput {
	if (outcome.kind === 'singleChain') return outcome.transaction

	return outcome.srcTransaction
}

function networkFeeLines(outcome: TransactionOutcome): Line[] {
	return ['Network fee:', formatAmountWithUsd(feeTransaction(outcome).cost)]
}

function transactionLines(outcome: TransactionOutcome): Line[] {
	if (outcome.kind === 'singleChain') {
		return ['Transaction:', FormattedString.code(outcome.transaction.id)]
	}

	return [
		...transactionOnChainLines(outcome.srcTransaction),
		'',
		...transactionOnChainLines(outcome.dstTransaction),
	]
}

function transactionOnChainLines(transaction: TransactionDtoOutput): Line[] {
	return [
		`Transaction on ${chainToName(transaction.chain)}:`,
		FormattedString.code(transaction.id),
	]
}

export function transactionOutcomeLines(outcome: TransactionOutcome): Line[] {
	return [...networkFeeLines(outcome), '', ...transactionLines(outcome)]
}
