import { InlineKeyboard } from 'grammy'
import {
	GetReferrerResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/units'
import { addNav, messageFromLines } from '../../utils'

const FEE_BASE = 10000
const PERIOD_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

type State = GetReferrerResponseDtoOutput['states'][number]
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

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

		const state: State =
			referrerData.states[0] ??
			(() => {
				throw new Error('No referrer state found')
			})()

		const periodStart =
			state.period.startTime !== null
				? new Date(state.period.startTime)
				: null
		const periodEnd =
			periodStart !== null
				? new Date(periodStart.getTime() + PERIOD_DAYS * MS_PER_DAY)
				: null

		const lines = [
			`Available to withdraw: ${state.rewards.available} ${state.currency}`,
			`Withdrawn: ${state.rewards.withdrawn} ${state.currency}`,
			'',
			`Current fee share: ${formatPercent(state.fee)}`,
			`Month volume: ${state.period.volume} ${state.currency}`,
			...(periodEnd !== null
				? ['', `Next period starts: ${formatDate(periodEnd)}`]
				: []),
		]

		if (tierTables.tierTables.length > 0) {
			lines.push('', ...tierTables.tierTables.flatMap(tierTableLines))
		}

		const keyboard = new InlineKeyboard()
			.url('Copy referral link', referralLink)
			.row()
			.text('Withdraw rewards', actionIds.showReferralWithdrawReward)
			.row()
			.text('About', actionIds.showReferralAbout)
			.row()

		addNav(keyboard, {
			parent: actionIds.showHome,
			home: actionIds.showHome,
		})

		return { message: messageFromLines(lines), keyboard }
	}
}
