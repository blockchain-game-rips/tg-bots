import {
	adminControllerUpdatePresetConfig,
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
import { parseUnits, toCurrencyId, toShortDurationFormat } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { NATIVE_ON_BASE } from '../constants'
import { Flow } from '../flows'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { Effect, EffectType } from '../types'
import { adminApiHeader } from '../utils/api'
import { parsePresetConfig } from '../validation/preset-config'

const CONFIG_PROMPT_MESSAGE = joinLines([
	'Enter the preset config as JSON.',
	'',
	'Example:',
	FormattedString.code(
		'{"presetId":1,"entryCap":16,"feePercent":500,"entryPrice":0.01,"durationSeconds":86400,"payoutDistribution":[{"payoutCount":1,"minPayout":0.1,"maxPayout":1.0}]}',
	),
	'',
	fmt`${FormattedString.b('entryCap')}: must be a power of 2 (e.g. 8, 16, 32)`,
	fmt`${FormattedString.b('feePercent')}: in basis points (e.g. 500 = 5%)`,
	fmt`${FormattedString.b('entryPrice')}, ${FormattedString.b('minPayout')}, ${FormattedString.b('maxPayout')}: human-readable ETH amounts`,
])

const CONFIG_PLACEHOLDER =
	'{"presetId":0,"entryCap":16,"feePercent":500,"entryPrice":0.01,"durationSeconds":86400,"payoutDistribution":[{"payoutCount":1,"minPayout":0.1,"maxPayout":1.0}]}'

export const openUpdatePresetConfig: ActionDef<void> = noPayload(() => ({
	flow: toReset(),
	effect: {
		type: EffectType.ASK,
		prompt: {
			message: CONFIG_PROMPT_MESSAGE,
			placeholder: CONFIG_PLACEHOLDER,
		},
		onSubmit: actionIds.submitConfirmUpdatePresetConfig,
	},
}))

export const submitConfirmUpdatePresetConfig: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(_session, payload) => {
			const config = parsePresetConfig(payload)

			const flow = toFlow<Flow, 'updatePresetConfig', 'confirm'>(
				'updatePresetConfig',
				'confirm',
				config,
			)

			const payoutSummary = config.payoutDistribution
				.map(
					(p) =>
						`  x${String(p.payoutCount)}: ${String(p.minPayout)}–${String(p.maxPayout)} ETH`,
				)
				.join('\n')

			const description = [
				`Preset #${String(config.presetId)} config update:`,
				`  Entry cap: ${String(config.entryCap)}`,
				`  Fee: ${String(config.feePercent)} bp`,
				`  Entry price: ${String(config.entryPrice)} ETH`,
				`  Duration: ${toShortDurationFormat(config.durationSeconds)}`,
				`  Payouts:\n${payoutSummary}`,
			].join('\n')

			return {
				flow,
				effect: {
					type: EffectType.EDIT,
					page: ConfirmationPage.render(
						description,
						actionIds.executeConfirmUpdatePresetConfig,
					),
				},
			}
		},
	)

export const executeConfirmUpdatePresetConfig: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'updatePresetConfig', 'confirm')

		const {
			presetId,
			entryCap,
			feePercent,
			entryPrice,
			durationSeconds,
			payoutDistribution,
		} = session.flow.data

		const effect: Effect = {
			type: EffectType.SEND_LOADING,
			message: fmt`Updating preset config...`,
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

				const toBigintAsString = (amount: number) =>
					parseUnits(amount.toString(), decimals).toString()

				const { data: tx } = await adminControllerUpdatePresetConfig({
					headers: adminApiHeader,
					path: { presetId: presetId.toString() },
					body: {
						config: {
							entryCap,
							feeBps: feePercent,
							entryPrice: {
								currencyChainAddress: NATIVE_ON_BASE,
								amount: toBigintAsString(entryPrice),
							},
							durationSeconds,
							payoutDistribution: payoutDistribution.map((p) => ({
								payoutCount: p.payoutCount.toString(),
								minPayout: toBigintAsString(p.minPayout),
								maxPayout: toBigintAsString(p.maxPayout),
							})),
						},
					},
				})

				return {
					flow: toReset(),
					effect: {
						type: EffectType.EDIT,
						page: TransactionPage.render(
							`Preset #${String(presetId)} config updated`,
							tx,
						),
					},
				}
			},
		}

		return { flow: toHold(), effect }
	},
)
