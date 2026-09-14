import { EligibilityPolicyDtoOutput } from '@rips/api-client'

/**
 * Why a user may not proceed. The two reasons are distinct because they end in
 * different places: the terms are one tap away, a blocked region is not.
 */
export enum Refusal {
	COUNTRY = 'country',
	TERMS = 'terms',
}

/**
 * The whole eligibility decision, in one pure function with two callers: the
 * guard passes the country and version off the stored record, and the gate path
 * passes the country it has just observed. `undefined` admits.
 *
 * Absence refuses on terms rather than country — a user who was never gated has
 * no observed country to judge, and the consent page is where they belong.
 * When both halves fail the country is named, because passing the terms again
 * would not clear it.
 *
 * A version at or above the current one admits, so rolling the policy back does
 * not lock out the users who accepted the newer text.
 */
export function verdict(
	country: string | undefined,
	acceptedTermsVersion: number | undefined,
	policy: EligibilityPolicyDtoOutput,
): Refusal | undefined {
	if (country === undefined) return Refusal.TERMS

	if (isCountryBlocked(country, policy)) return Refusal.COUNTRY

	if (
		acceptedTermsVersion === undefined ||
		acceptedTermsVersion < policy.termsVersion
	) {
		return Refusal.TERMS
	}

	return undefined
}

/**
 * The block list, read in one place. The gate path asks this directly rather
 * than the whole verdict: it has just observed the country and is about to
 * record the acceptance itself, so it has no accepted version to judge yet.
 *
 * The observed country's casing is not guaranteed by whoever reported it.
 */
export function isCountryBlocked(
	country: string,
	policy: EligibilityPolicyDtoOutput,
): boolean {
	return policy.blockedCountries.some(
		(blocked) => blocked.toUpperCase() === country.toUpperCase(),
	)
}
