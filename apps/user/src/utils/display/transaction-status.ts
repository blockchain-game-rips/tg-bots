import {
	notSentMessage,
	OutcomeNouns,
	revertedMessage,
	unknownMessage,
} from './transaction-outcome-copy'

/** Every transaction step the API returns shares these four statuses. */
export type TransactionStep<Result> =
	| { status: 'not-sent' }
	| { status: 'succeeded'; result: Result }
	| { status: 'reverted' }
	| { status: 'unknown' }

/**
 * The message for a step that did not succeed. Callers narrow the success case
 * first, so reaching here with one is a bug.
 */
export function failureMessage(
	step: { status: 'not-sent' | 'reverted' | 'unknown' },
	nouns: OutcomeNouns,
): string {
	switch (step.status) {
		case 'not-sent':
			return notSentMessage(nouns)

		case 'reverted':
			return revertedMessage(nouns)

		case 'unknown':
			return unknownMessage(nouns)
	}
}
