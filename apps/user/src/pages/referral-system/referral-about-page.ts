import { GetTierTablesResponseDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { referralBreadcrumb } from '../../utils/display/breadcrumb'

type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

// Ranks are listed from the lowest tier upward. Admins can configure any number
// of tiers, so anything beyond this list falls back to a neutral marker.
const TIER_RANKS = [
	{ emoji: '🟤', name: 'Bronze' },
	{ emoji: '⚪', name: 'Silver' },
	{ emoji: '🟡', name: 'Gold' },
	{ emoji: '🔵', name: 'Platinum' },
	{ emoji: '🟣', name: 'Diamond' },
]
const FALLBACK_EMOJI = '🟢'

function tierLabel(rankIndex: number): string {
	const rank = TIER_RANKS[rankIndex]

	if (rank === undefined) {
		return `${FALLBACK_EMOJI} Tier ${(rankIndex + 1).toString()}`
	}

	return `${rank.emoji} ${rank.name}`
}

const NO_VOLUME = '0'

function tierTableLines(tierTable: TierTable): Line[] {
	const { currency, defaultFeeBps } = tierTable

	// The default fee applies to everyone, so it is the entry rank. The backend
	// resolves a referrer's fee as max(defaultFee, tierFee), which makes tiers at
	// or below the default unreachable — they are left out.
	const reachableTiers = tierTable.tiers
		.filter((tier) => tier.feeBps > defaultFeeBps)
		.sort((a, b) => (BigInt(a.minVolume) < BigInt(b.minVolume) ? -1 : 1))

	const rankedTiers = [
		{ minVolume: NO_VOLUME, feeBps: defaultFeeBps },
		...reachableTiers,
	]

	const tierBlocks = rankedTiers
		.map((tier, rankIndex): Line[] => {
			const minVolume = formatAmountWithUsd({
				amount: tier.minVolume,
				currency,
			})

			return [
				`${tierLabel(rankIndex)} - ${formatPercent(tier.feeBps)}`,
				`Volume ≥ ${minVolume}`,
				'',
			]
		})
		.reverse()
		.flat()

	return [
		FormattedString.b(`${currency.symbol} volume tiers`),
		'',
		...tierBlocks,
	]
}

export const ReferralAboutPage = {
	render(tierTables: GetTierTablesResponseDtoOutput): PageContent {
		const lines: Line[] = [
			referralBreadcrumb('Tiers'),
			'',
			'When someone uses your referral link and pays a protocol fee, you receive a share of that fee as a reward.',
			'',
			FormattedString.b('Fee share'),
			'Your fee share percentage is determined at the start of each 30-day period based on your total referred volume in the previous period.',
			'The higher your volume, the higher your tier and fee share.',
			'',
		]

		if (tierTables.tierTables.length > 0) {
			lines.push(...tierTables.tierTables.flatMap(tierTableLines))
		}

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard().appendNavButtons({
				parent: actionIds.openReferral,
				home: actionIds.openHome,
			}),
		}
	},
}
