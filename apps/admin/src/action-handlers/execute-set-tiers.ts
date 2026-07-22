import {
	adminControllerSetReferralTiers,
	currencyControllerGetCurrencies,
} from '@rips/api-client'
import {
	ActionDef,
	assertFlow,
	fmt,
	FormattedString,
	joinLines,
	toFlow,
	toHold,
	toReset,
} from '@rips/grammy-kit'
import { parseUnits, toCurrencyId } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { NATIVE_ON_BASE } from '../constants'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType } from '../types'
import { adminApiHeader } from '../utils/api'
import { parseTierList } from '../validation/tier-list'

const TIERS_PROMPT_MESSAGE = joinLines([
	'Enter the referral tier list as JSON.',
	'',
	'Example:',
	FormattedString.code(
		'[{"minVolume":0,"feePercent":500},{"minVolume":1.5,"feePercent":300}]',
	),
	'',
	fmt`${FormattedString.b('minVolume')}: minimum cumulative volume in human-readable units (e.g. 1.5 ETH)`,
	fmt`${FormattedString.b('feePercent')}: fee in basis points (e.g. 500 = 5%)`,
])

const TIERS_PLACEHOLDER = '[{"minVolume":0,"feePercent":500}]'

export const openSetTiers: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: TIERS_PROMPT_MESSAGE,
			placeholder: TIERS_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmSetTiers,
	},
}))

export const submitConfirmSetTiers: ActionDef<string> = withPayload<string>(
	(v) => v,
	(v) => v,
	(_session, payload) => {
		const tiers = parseTierList(payload)

		const flow = toFlow<Flow, 'setTiers', 'confirm'>(
			'setTiers',
			'confirm',
			{ tiers },
		)

		const tierSummary = tiers
			.map(
				(t) =>
					`  minVolume: ${String(t.minVolume)}, fee: ${String(t.feePercent)} bp`,
			)
			.join('\n')

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: ConfirmationPage.render(
					fmt`This will set ${FormattedString.b(String(tiers.length))} referral tier(s):\n${tierSummary}`,
					actionIds.executeConfirmSetTiers,
				),
			},
		}
	},
)

export const executeConfirmSetTiers: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'setTiers', 'confirm')

	const { tiers } = session.flow.data

	const effect: Effect = {
		type: EffectType.SEND_LOADING,
		message: fmt`Setting referral tiers...`,
		next: async () => {
			const { data: currenciesRes } =
				await currencyControllerGetCurrencies({
					query: { chainAddress: [toCurrencyId(NATIVE_ON_BASE)] },
				})

			const nativeCurrency = currenciesRes.currencies[0]

			if (!nativeCurrency) {
				throw new Error('NATIVE_ON_BASE currency not found')
			}

			const { decimals } = nativeCurrency

			const rawTiers = tiers.map((t) => ({
				minVolume: parseUnits(
					t.minVolume.toString(),
					decimals,
				).toString(),
				feeBps: t.feePercent,
			}))

			const { data: tx } = await adminControllerSetReferralTiers({
				headers: adminApiHeader,
				path: { currency: NATIVE_ON_BASE.address },
				body: { tiers: rawTiers },
			})

			return {
				flow: toReset(),
				effect: {
					type: EffectType.EDIT,
					page: TransactionPage.render(
						`Referral tiers updated (${String(tiers.length)} tier(s))`,
						tx,
					),
				},
			}
		},
	}

	return { flow: toHold(), effect }
})
