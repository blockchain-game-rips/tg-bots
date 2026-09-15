import { adminControllerSetReferrerCustomFee } from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	fmt,
	FormattedString,
	joinLines,
	toFlow,
	toReset,
} from '@rips/grammy-kit'
import { parseEvmAddress } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'
import { parseFeeBp } from '../validation/fee-bp'

const CLEARED_FEE_BP = 0

const ADDRESS_PROMPT_MESSAGE = fmt`Enter the referrer EVM address to override.`
const ADDRESS_PLACEHOLDER = '0x...'

const FEE_PROMPT_MESSAGE = joinLines([
	'Enter the custom referral fee in basis points (bp).',
	'',
	fmt`${FormattedString.code('1000 bp')} = 10%`,
	fmt`${FormattedString.code('100 bp')} = 1%`,
	'',
	fmt`${FormattedString.code('0 bp')} clears the override, so the referrer falls back to the tier rules.`,
])

const FEE_PLACEHOLDER = 'e.g. 1000 for 10%'

function describeFee(address: string, feeBps: number): FormattedString {
	return feeBps === CLEARED_FEE_BP
		? fmt`This will ${FormattedString.b('clear')} the custom fee of referrer ${FormattedString.code(address)}, falling back to the tier rules.`
		: fmt`This will set the custom fee of referrer ${FormattedString.code(address)} to ${FormattedString.b(`${String(feeBps)} bp`)}, overriding the tier rules.`
}

export const openSetReferrerCustomFee: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: ADDRESS_PROMPT_MESSAGE,
			placeholder: ADDRESS_PLACEHOLDER,
		},
		onSubmit: actionIds.submitSetReferrerCustomFeeAddress,
	},
}))

export const submitSetReferrerCustomFeeAddress: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(_session, payload) => {
			const address = parseEvmAddress(payload)

			const flow = toFlow<Flow, 'setReferrerCustomFee', 'fee'>(
				'setReferrerCustomFee',
				'fee',
				{ address },
			)

			return {
				flow,
				effect: {
					type: EffectType.ASK,
					prompt: {
						message: FEE_PROMPT_MESSAGE,
						placeholder: FEE_PLACEHOLDER,
					},
					onSubmit: actionIds.submitConfirmSetReferrerCustomFee,
				},
			}
		},
	)

export const submitConfirmSetReferrerCustomFee: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(session, payload) => {
			assertFlow(session, 'setReferrerCustomFee', 'fee')

			const { address } = session.flow.data
			const feeBps = parseFeeBp(payload)

			const flow = toFlow<Flow, 'setReferrerCustomFee', 'confirm'>(
				'setReferrerCustomFee',
				'confirm',
				{ address, feeBps },
			)

			return {
				flow,
				effect: {
					type: EffectType.NAVIGATE,
					page: ConfirmationPage.render(
						describeFee(address, feeBps),
						actionIds.executeConfirmSetReferrerCustomFee,
					),
				},
			}
		},
	)

export const executeConfirmSetReferrerCustomFee: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'setReferrerCustomFee', 'confirm')

		const { address, feeBps } = session.flow.data

		return {
			effect: {
				type: EffectType.LOADING,
				message:
					feeBps === CLEARED_FEE_BP
						? fmt`Clearing custom fee...`
						: fmt`Setting custom fee...`,
				next: async () => {
					const { data: tx } =
						await adminControllerSetReferrerCustomFee({
							headers: { 'x-admin-api-key': adminApiKey },
							path: { address },
							body: { feeBps },
						})

					const titles =
						feeBps === CLEARED_FEE_BP
							? {
									succeeded: `Custom fee of ${address} cleared`,
									operation: 'Clearing the custom fee',
								}
							: {
									succeeded: `Custom fee of ${address} set to ${String(feeBps)} bp`,
									operation: 'Setting the custom fee',
								}

					return {
						flow: toReset(),
						effect: {
							type: EffectType.NAVIGATE,
							page: TransactionPage.render(titles, tx),
							history: { kind: 'page' },
						},
					}
				},
			},
		}
	},
)
