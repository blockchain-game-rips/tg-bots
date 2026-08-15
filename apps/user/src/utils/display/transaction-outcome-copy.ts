import { CurrencyAmountDtoOutput } from '@rips/api-client'
import { formatAmountWithUsd } from '@rips/shared'
import { chainToName } from '../chain-display'
import { currencyToChain } from '@rips/shared'

/**
 * What the user was doing, in their own words. The API's nouns (purchase, buy,
 * withdraw reward) never reach the screen.
 */
export interface OutcomeNouns {
	/** Subject of "Your {operation} didn't go through". */
	operation: string

	/** Verb for "you could end up {verbing} twice". */
	verbing: string

	/** What is at stake — funds for a wallet, rewards for a claim. */
	stake: string
}

export const enterNouns: OutcomeNouns = {
	operation: 'entry',
	verbing: 'entering',
	stake: 'funds',
}

export const swapNouns: OutcomeNouns = {
	operation: 'swap',
	verbing: 'swapping',
	stake: 'funds',
}

export const withdrawNouns: OutcomeNouns = {
	operation: 'withdrawal',
	verbing: 'withdrawing',
	stake: 'funds',
}

export const claimNouns: OutcomeNouns = {
	operation: 'claim',
	verbing: 'claiming',
	stake: 'rewards',
}

export const STALE_SCREEN_NOTE =
	'⚠️ Couldn’t refresh this screen. Press Refresh to see your current funds.'

function didNotGoThrough(nouns: OutcomeNouns): string {
	return `Your ${nouns.operation} didn’t go through.`
}

export function notSentMessage(nouns: OutcomeNouns): string {
	return `${didNotGoThrough(nouns)} Nothing was sent, so your ${nouns.stake} are untouched — you can try again.`
}

export function revertedMessage(nouns: OutcomeNouns): string {
	return `${didNotGoThrough(nouns)} The transaction failed on-chain, so the network fee was still charged.`
}

export function unknownMessage(nouns: OutcomeNouns): string {
	return `We couldn’t confirm whether your ${nouns.operation} went through. Check your ${nouns.stake} before trying again — you could end up ${nouns.verbing} twice.`
}

export function refundedMessage(
	nouns: OutcomeNouns,
	refund: CurrencyAmountDtoOutput,
): string {
	const chain = chainToName(currencyToChain(refund.currency))

	return `${didNotGoThrough(nouns)} ${formatAmountWithUsd(refund)} is on its way back to your wallet on ${chain}.`
}

export function cancelledMessage(nouns: OutcomeNouns): string {
	return `${didNotGoThrough(nouns)} If any ${nouns.stake} were taken, they’ll come back to your wallet — this can take a few minutes.`
}
