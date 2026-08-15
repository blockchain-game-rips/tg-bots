import { TransactionDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { Chain } from '@rips/shared'
import { chainToName } from '../utils/chain-display'

/**
 * The copy shown while an operation runs. Each flow opens on its own
 * breadcrumb emoji so a loading frame reads as part of the flow it interrupts.
 *
 * Crosschain operations are the only ones that learn of a confirmed send
 * before they know the outcome, so they alone get a second frame: the funds
 * have left by then, and the frame hands the user the transaction to watch.
 */

export const WITHDRAW_FRAME = fmt`📤 Sending your withdrawal...`

export const CLAIM_FRAME = fmt`👥 Claiming your rewards...`

export const SWAP_FRAME = fmt`🌉 Swapping...`

export const SWAP_SENDING_FRAME = fmt`🌉 Sending your swap...`

export const ENTER_FRAME = fmt`🎮 Entering the rip...`

export const ENTER_SENDING_FRAME = fmt`🎮 Sending your entry...`

/**
 * The source leg only — the destination transaction does not exist yet. Shown
 * as a copyable code block rather than a button because loading frames carry
 * no keyboard: a tap here would race the operation still in flight.
 */
export function sentFrame(
	transaction: TransactionDtoOutput,
	destinationChain: Chain,
): FormattedString {
	const lines: Line[] = [
		'⏳ Transaction sent',
		'',
		`Transaction on ${chainToName(transaction.chain)}:`,
		FormattedString.code(transaction.id),
		'',
		`Waiting for it to land on ${chainToName(destinationChain)}...`,
	]

	return joinLines(lines)
}
