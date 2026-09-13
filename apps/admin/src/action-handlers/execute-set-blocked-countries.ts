import { eligibilityControllerSetBlockedCountries } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	fmt,
	FormattedString,
	joinLines,
	toFlow,
	toReset,
} from '@rips/grammy-kit'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { PolicyPage } from '../pages/policy-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'
import { policyWrite } from '../utils/policy-error'
import {
	EMPTY_COUNTRY_LIST_MARKER,
	parseCountryList,
} from '../validation/country-list'

const COUNTRIES_PROMPT_MESSAGE = joinLines([
	'Send the full list of blocked countries as ISO 3166-1 alpha-2 codes.',
	'',
	'The list replaces the current one — send every country that should be blocked, not just the new ones.',
	'',
	fmt`Example: ${FormattedString.code('RU, KP, IR')}`,
	fmt`Send ${FormattedString.code(EMPTY_COUNTRY_LIST_MARKER)} to block no countries.`,
])

const COUNTRIES_PLACEHOLDER = 'e.g. RU, KP, IR'

export const openSetBlockedCountries: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: COUNTRIES_PROMPT_MESSAGE,
			placeholder: COUNTRIES_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmSetBlockedCountries,
	},
}))

export const submitConfirmSetBlockedCountries: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(_session, payload) => {
			const countries = parseCountryList(payload)

			const flow = toFlow<Flow, 'setBlockedCountries', 'confirm'>(
				'setBlockedCountries',
				'confirm',
				{ countries },
			)

			const description =
				countries.length === 0
					? fmt`This will block ${FormattedString.b('no countries')}, clearing the current list.`
					: fmt`This will block ${FormattedString.b(countries.join(', '))}, replacing the current list.`

			return {
				flow,
				effect: {
					type: EffectType.NAVIGATE,
					page: ConfirmationPage.render(
						description,
						actionIds.executeConfirmSetBlockedCountries,
					),
				},
			}
		},
	)

export const executeConfirmSetBlockedCountries: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'setBlockedCountries', 'confirm')

		const { countries } = session.flow.data

		return {
			effect: {
				type: EffectType.LOADING,
				message: fmt`Updating blocked countries...`,
				next: async () => {
					const policy = await setBlockedCountries(countries)

					return {
						flow: toReset(),
						effect: {
							type: EffectType.NAVIGATE,
							page: PolicyPage.render(
								'Blocked countries updated',
								policy,
							),
							history: { kind: 'page' },
						},
					}
				},
			},
		}
	},
)

async function setBlockedCountries(countries: string[]) {
	const { data } = await policyWrite(() =>
		eligibilityControllerSetBlockedCountries({
			headers: { 'x-admin-api-key': adminApiKey },
			body: { blockedCountries: countries },
		}),
	)

	return data
}
