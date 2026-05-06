import {
	adminControllerSetReferralTiers,
	currencyControllerGetCurrencies,
} from '../../generated/api-client'
import { actionIds } from '../actions'
import { NATIVE_ON_BASE } from '../constants'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType, SessionData } from '../types'
import { parseUnits, toCurrencyId } from '../utils/currency'
import { assertFlow, setFlow } from '../utils/session-utils'
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

export function openSetTiers(
	_session: SessionData,
	_payload: string | undefined,
): Effect {
	return {
		type: EffectType.ASK,
		prompt: {
			message: TIERS_PROMPT_MESSAGE,
			placeholder: TIERS_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmSetTiers,
	}
}

export function submitConfirmSetTiers(
	session: SessionData,
	payload: string | undefined,
): Effect {
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
}

export function executeConfirmSetTiers(
	session: SessionData,
	_payload: string | undefined,
): Effect {
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
}
