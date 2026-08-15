import { adminControllerSetDefaultReferralFee } from '@rips/api-client'
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
import { actionIds } from '../actions'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'
import { parseFeeBp } from '../validation/fee-bp'

const FEE_PROMPT_MESSAGE = joinLines([
	'Enter the default referral fee in basis points (bp).',
	'',
	fmt`${FormattedString.code('1000 bp')} = 10%`,
	fmt`${FormattedString.code('100 bp')} = 1%`,
	fmt`${FormattedString.code('1 bp')} = 0.01%`,
])

const FEE_PLACEHOLDER = 'e.g. 1000 for 10%'

export const openSetDefaultFee: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: FEE_PROMPT_MESSAGE,
			placeholder: FEE_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmSetDefaultFee,
	},
}))

export const submitConfirmSetDefaultFee: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(_session, payload) => {
			const bp = parseFeeBp(payload)

			const flow = toFlow<Flow, 'setDefaultFee', 'confirm'>(
				'setDefaultFee',
				'confirm',
				{ bp },
			)

			return {
				flow,
				effect: {
					type: EffectType.NAVIGATE,
					page: ConfirmationPage.render(
						fmt`This will set the default referral fee to ${FormattedString.b(`${String(bp)} bp`)}.`,
						actionIds.executeConfirmSetDefaultFee,
					),
				},
			}
		},
	)

export const executeConfirmSetDefaultFee: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'setDefaultFee', 'confirm')

		const { bp } = session.flow.data

		return {
			effect: {
				type: EffectType.LOADING,
				message: fmt`Setting default fee...`,
				next: async () => {
					const { data: tx } =
						await adminControllerSetDefaultReferralFee({
							headers: adminApiHeader,
							body: { feeBps: bp },
						})

					return {
						flow: toReset(),
						effect: {
							type: EffectType.NAVIGATE,
							page: TransactionPage.render(
								{
									succeeded: `Default fee set to ${String(bp)} bp`,
									operation: 'Setting the default fee',
								},
								tx,
							),
							history: { kind: 'page' },
						},
					}
				},
			},
		}
	},
)
