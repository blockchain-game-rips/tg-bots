import { UserEligibilityDtoOutput } from '@rips/api-client'

/**
 * Absence means the user was never gated, which refuses. A version at or above
 * the current one admits, so rolling the policy back does not lock out the
 * users who accepted the newer text.
 *
 * The country half of the verdict is not decided here yet.
 */
export function hasAcceptedCurrentTerms(
	eligibility: UserEligibilityDtoOutput | undefined,
	currentTermsVersion: number,
): boolean {
	if (eligibility === undefined) return false

	return eligibility.termsVersion >= currentTermsVersion
}
