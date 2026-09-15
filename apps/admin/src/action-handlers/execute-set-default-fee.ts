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
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'
import { FEE_PLACEHOLDER, parseFeeBp } from '../validation/fee-bp'

const FEE_PROMPT_MESSAGE = joinLines([
	'Enter the default referral fee in basis points (bp).',
	'',
	fmt`${FormattedString.code('1000 bp')} = 10%`,
	fmt`${FormattedString.code('100 bp')} = 1%`,
	fmt`${FormattedString.code('1 bp')} = 0.01%`,
])

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
			const feeBps = parseFeeBp(payload)

			const flow = toFlow<Flow, 'setDefaultFee', 'confirm'>(
				'setDefaultFee',
				'confirm',
				{ feeBps },
			)

			return {
				flow,
				effect: {
					type: EffectType.NAVIGATE,
					page: ConfirmationPage.render(
						fmt`This will set the default referral fee to ${FormattedString.b(`${String(feeBps)} bp`)}.`,
						actionIds.executeConfirmSetDefaultFee,
					),
				},
			}
		},
	)

export const executeConfirmSetDefaultFee: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'setDefaultFee', 'confirm')

		const { feeBps } = session.flow.data

		return {
			effect: {
				type: EffectType.LOADING,
				message: fmt`Setting default fee...`,
				next: async () => {
					const { data: tx } =
						await adminControllerSetDefaultReferralFee({
							headers: { 'x-admin-api-key': adminApiKey },
							body: { feeBps },
						})

					return {
						flow: toReset(),
						effect: {
							type: EffectType.NAVIGATE,
							page: TransactionPage.render(
								{
									succeeded: `Default fee set to ${String(feeBps)} bp`,
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
