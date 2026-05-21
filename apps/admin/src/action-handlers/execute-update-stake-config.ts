import {
	adminControllerUpdateStakeConfig,
	currencyControllerGetCurrencies,
} from '@rips/api-client'
import { ActionDef, assertFlow, setFlow } from '@rips/grammy-kit'
import { parseUnits, toCurrencyId, toShortDurationFormat } from '@rips/shared'
import { noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { NATIVE_ON_BASE } from '../constants'
import { ConfirmationPage } from '../pages/confirmation-page'
import { TransactionPage } from '../pages/transaction-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'
import { parseStakeConfig } from '../validation/stake-config'

const CONFIG_PROMPT_MESSAGE = [
	'Enter the stake config as JSON.',
	'',
	'Example:',
	'<code>{"stakeId":1,"ticketCap":16,"feePercent":500,"ticketPrice":0.01,"durationSeconds":86400,"prizeDistribution":[{"prizeCount":1,"minPrize":0.1,"maxPrize":1.0}]}</code>',
	'',
	'<b>ticketCap</b>: must be a power of 2 (e.g. 8, 16, 32)',
	'<b>feePercent</b>: in basis points (e.g. 500 = 5%)',
	'<b>ticketPrice</b>, <b>minPrize</b>, <b>maxPrize</b>: human-readable ETH amounts',
].join('\n')

const CONFIG_PLACEHOLDER =
	'{"stakeId":0,"ticketCap":16,"feePercent":500,"ticketPrice":0.01,"durationSeconds":86400,"prizeDistribution":[{"prizeCount":1,"minPrize":0.1,"maxPrize":1.0}]}'

export const openUpdateStakeConfig: ActionDef<void> = noPayload(() => ({
	type: EffectType.ASK,
	prompt: {
		message: CONFIG_PROMPT_MESSAGE,
		placeholder: CONFIG_PLACEHOLDER,
	},
	onSubmit: actionIds.submitConfirmUpdateStakeConfig,
}))

export const submitConfirmUpdateStakeConfig: ActionDef<string> =
	withPayload<string>(
		(v) => v,
		(v) => v,
		(session, payload) => {
			const config = parseStakeConfig(payload)

			setFlow(session, 'updateStakeConfig', 'confirm', config)

			const prizeSummary = config.prizeDistribution
				.map(
					(p) =>
						`  x${String(p.prizeCount)}: ${String(p.minPrize)}–${String(p.maxPrize)} ETH`,
				)
				.join('\n')

			const description = [
				`Stake #${String(config.stakeId)} config update:`,
				`  Ticket cap: ${String(config.ticketCap)}`,
				`  Fee: ${String(config.feePercent)} bp`,
				`  Ticket price: ${String(config.ticketPrice)} ETH`,
				`  Duration: ${toShortDurationFormat(config.durationSeconds)}`,
				`  Prizes:\n${prizeSummary}`,
			].join('\n')

			return {
				type: EffectType.EDIT,
				page: ConfirmationPage.render(
					description,
					actionIds.executeConfirmUpdateStakeConfig,
				),
			}
		},
	)

export const executeConfirmUpdateStakeConfig: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'updateStakeConfig', 'confirm')

		const {
			stakeId,
			ticketCap,
			feePercent,
			ticketPrice,
			durationSeconds,
			prizeDistribution,
		} = session.flow.data

		return {
			type: EffectType.SEND_LOADING,
			message: 'Updating stake config...',
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

				const { data: tx } = await adminControllerUpdateStakeConfig({
					headers: adminApiHeader,
					path: { stakeId: stakeId.toString() },
					body: {
						config: {
							ticketCap,
							feePercent,
							ticketPrice: {
								currencyChainAddress: NATIVE_ON_BASE,
								amount: toBigintAsString(ticketPrice),
							},
							durationSeconds,
							prizeDistribution: prizeDistribution.map((p) => ({
								prizeCount: p.prizeCount.toString(),
								minPrize: toBigintAsString(p.minPrize),
								maxPrize: toBigintAsString(p.maxPrize),
							})),
						},
					},
				})

				return {
					type: EffectType.EDIT,
					page: TransactionPage.render(
						`Stake #${String(stakeId)} config updated`,
						tx,
					),
				}
			},
		}
	},
)
