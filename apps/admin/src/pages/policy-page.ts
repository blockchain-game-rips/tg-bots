import { EligibilityPolicyDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { actionIds } from '../action-ids'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'
import { formatBlockedCountries } from '../validation/country-list'

/**
 * Shared by every policy write, so a second update takes the first one's place
 * and back leaves for the hub rather than a stale copy of the same screen.
 */
export const POLICY_SLOT = 'policy'

const HOME_LABEL = 'Home'

export const PolicyPage = {
	render(title: string, policy: EligibilityPolicyDtoOutput): PageContent {
		const blocked = formatBlockedCountries(policy.blockedCountries)

		const lines: Line[] = [
			FormattedString.b(title),
			'',
			fmt`Blocked: ${FormattedString.code(blocked)}`,
			`Terms version: ${String(policy.termsVersion)}`,
		]

		const keyboard = keyboardFromLayout([
			[{ label: HOME_LABEL, actionId: actionIds.openHome }],
		])

		return { message: joinLines(lines), keyboard, trailSlot: POLICY_SLOT }
	},
}
