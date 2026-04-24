import { InlineKeyboard } from 'grammy'
import {
	GetReferrerResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

const FEE_BASE = 10000
const PERIOD_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

type State = GetReferrerResponseDtoOutput['states'][number]
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

function effectiveFeePercent(state: State): number {
	if (state.customFeePercent > 0) return state.customFeePercent

	return Math.max(state.activeFeePercent, state.defaultFeePercent)
}

function formatPercent(basisPoints: number): string {
	return `${((basisPoints / FEE_BASE) * 100).toFixed(2)}%`
}

function formatDate(date: Date): string {
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function tierTableLines(tierTable: TierTable): string[] {
	return [
		`Tiers (${tierTable.currency.symbol}):`,
		...tierTable.tiers.map((tier, i) => {
			const minVolume = formattedAmountWithUsd({
				amount: tier.minVolume,
				currency: tierTable.currency,
			})
			return `  Tier ${i + 1}: ≥${minVolume} → ${formatPercent(tier.feePercent)}`
		}),
	]
}

export class ReferralSystemPage {
	static render(args: {
		referrerData: GetReferrerResponseDtoOutput
		tierTables: GetTierTablesResponseDtoOutput
		referralLink: string
	}): PageContent {
		const { referrerData, tierTables, referralLink } = args

		const state = referrerData.states[0]
		const availableToWithdraw = referrerData.rewards.availableToWithdraw[0]
		const withdrawnRewards = referrerData.rewards.withdrawnRewards[0]

		const lines = [
			`Available to withdraw: ${availableToWithdraw !== undefined ? formattedAmountWithUsd(availableToWithdraw) : '—'}`,
			`Withdrawn: ${withdrawnRewards !== undefined ? formattedAmountWithUsd(withdrawnRewards) : '—'}`,
			'',
			`Current fee share: ${formatPercent(state !== undefined ? effectiveFeePercent(state) : 0)}`,
		]

		if (state !== undefined) {
			const periodEnd = new Date(
				Number(state.monthStartTimestamp) * 1000 +
					PERIOD_DAYS * MS_PER_DAY,
			)

			lines.push(
				`Month volume: ${formattedAmountWithUsd(state.currMonthVolume)}`,
				'',
				`Next period starts: ${formatDate(periodEnd)}`,
				`Fee share after recalc: ${formatPercent(state.defaultFeePercent)}`,
			)
		}

		if (tierTables.tierTables.length > 0) {
			lines.push('', ...tierTables.tierTables.flatMap(tierTableLines))
		}

		const keyboard = new InlineKeyboard()
			.url('Copy referral link', referralLink)
			.row()
			.text(
				'Withdraw rewards',
				buildCommand({
					pageId: pageIds.withdraw,
					type: 'open',
					payloads: [],
				}),
			)
			.row()
			.text(
				'About',
				buildCommand({
					pageId: pageIds.referralAbout,
					type: 'open',
					payloads: [],
				}),
			)
			.row()

		addNav(keyboard, { parent: pageIds.home, home: pageIds.home })

		return { message: lines.join('\n'), keyboard }
	}
}
