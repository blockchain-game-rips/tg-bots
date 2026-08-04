import { GetTierTablesResponseDtoOutput } from '@rips/api-client'
import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

function tierTableLines(tierTable: TierTable): Line[] {
	return [
		FormattedString.b(`${tierTable.currency.symbol} volume tiers:`),
		...tierTable.tiers.map((tier, i) => {
			const minVolume = formatAmountWithUsd({
				amount: tier.minVolume,
				currency: tierTable.currency,
			})
			return `  Tier ${(i + 1).toString()}: ≥${minVolume} → ${formatPercent(tier.feeBps)} of protocol fee`
		}),
	]
}

export const ReferralAboutPage = {
	render(tierTables: GetTierTablesResponseDtoOutput): PageContent {
		const lines: Line[] = [
			FormattedString.b('How the referral system works'),
			'',
			'When someone uses your referral link and pays a protocol fee, you receive a share of that fee as a reward.',
			'',
			FormattedString.b('Fee share'),
			'Your fee share percentage is determined at the start of each 30-day period based on your total referred volume in the previous period.',
			'The higher your volume, the higher your tier and fee share.',
			'',
			FormattedString.b('Custom percent'),
			'If you have a custom fee percent set, it always takes priority over the tier-based percent.',
		]

		if (tierTables.tierTables.length > 0) {
			lines.push('', ...tierTables.tierTables.flatMap(tierTableLines))
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
