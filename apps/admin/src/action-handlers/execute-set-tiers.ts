import {
	adminControllerSetReferralTiers,
	currencyControllerGetCurrencies,
} from '@rips/api-client'
import { ActionDef, assertFlow, setFlow } from '@rips/grammy-kit'
import { parseUnits, toCurrencyId } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { NATIVE_ON_BASE } from '../constants'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'
import { parseTierList } from '../validation/tier-list'

const TIERS_PROMPT_MESSAGE = [
	'Enter the referral tier list as JSON.',
	'',
	'Example:',
	'<code>[{"minVolume":0,"feePercent":500},{"minVolume":1.5,"feePercent":300}]</code>',
	'',
	'<b>minVolume</b>: minimum cumulative volume in human-readable units (e.g. 1.5 ETH)',
	'<b>feePercent</b>: fee in basis points (e.g. 500 = 5%)',
].join('\n')

const TIERS_PLACEHOLDER = '[{"minVolume":0,"feePercent":500}]'

export const openSetTiers: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: {
		message: TIERS_PROMPT_MESSAGE,
		placeholder: TIERS_PLACEHOLDER,
	},
	onSubmit: actionIds.submitConfirmSetTiers,
}))

export const submitConfirmSetTiers: ActionDef<string> = withPayload<string>(
	(v) => v,
	(v) => v,
	(session, payload) => {
		const tiers = parseTierList(payload)

		setFlow(session, 'setTiers', 'confirm', { tiers })

		const tierSummary = tiers
			.map((t) => `  minVolume: ${t.minVolume}, fee: ${t.feePercent} bp`)
			.join('\n')

		return {
			type: EffectType.EDIT,
			page: ConfirmationPage.render(
				`This will set <b>${tiers.length}</b> referral tier(s):\n${tierSummary}`,
				actionIds.executeConfirmSetTiers,
			),
		}
	},
)

export const executeConfirmSetTiers: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'setTiers', 'confirm')

	const { tiers } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: 'Setting referral tiers...',
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
				feePercent: t.feePercent,
			}))

			const { data: tx } = await adminControllerSetReferralTiers({
				headers: adminApiHeader,
				path: { currency: NATIVE_ON_BASE.address },
				body: { tiers: rawTiers },
			})

			return {
				type: EffectType.EDIT,
				page: TransactionPage.render(
					`Referral tiers updated (${tiers.length} tier(s))`,
					tx,
				),
			}
		},
	}
})
