import {
	GetReferrerResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { formatAmountWithUsd } from '../../utils/format/currency'
import { formatPercent } from '../../utils/format/percent'

const PERIOD_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

type State = GetReferrerResponseDtoOutput['states'][number]
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

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
			const minVolume = formatAmountWithUsd({
				amount: tier.minVolume,
				currency: tierTable.currency,
			})
			return `  Tier ${(i + 1).toString()}: ≥${minVolume} → ${formatPercent(tier.feePercent)}`
		}),
	]
}

export const ReferralSystemPage = {
	render(args: {
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

		const toStateCurrencyAmount = (amount: string) => ({
			amount,
			currency: state.currency,
		})

		const lines = [
			`Available to withdraw: ${formatAmountWithUsd(toStateCurrencyAmount(state.rewards.available))}`,
			`Withdrawn: ${formatAmountWithUsd(toStateCurrencyAmount(state.rewards.withdrawn))}`,
			'',
			`Current fee share: ${formatPercent(state.fee)}`,
			`Month volume: ${formatAmountWithUsd(toStateCurrencyAmount(state.period.volume))}`,
			...(periodEnd !== null
				? ['', `Next period starts: ${formatDate(periodEnd)}`]
				: []),
		]

		if (tierTables.tierTables.length > 0) {
			lines.push('', ...tierTables.tierTables.flatMap(tierTableLines))
		}

		const keyboard = new InlineKeyboard()
			.copyText('Copy referral link', referralLink)
			.row()
			.text(
				'Withdraw rewards',
				buildActionData(
					actionIds.openReferralWithdrawReward,
					undefined,
				),
			)
			.row()
			.text(
				'About',
				buildActionData(actionIds.openReferralAbout, undefined),
			)
			.row()

		addNav(keyboard, {
			parent: actionIds.openHome,
			home: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
