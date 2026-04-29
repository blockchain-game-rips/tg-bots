import { InlineKeyboard } from 'grammy'
import { GetTierTablesResponseDtoOutput } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { formattedAmountWithUsd } from '../../../utils/currency'
import { addNav } from '../../../utils/keyboard'
import { messageFromLines } from '../../../utils/message'

const FEE_BASE = 10000

type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

function formatPercent(basisPoints: number): string {
	return `${((basisPoints / FEE_BASE) * 100).toFixed(2)}%`
}

function tierTableLines(tierTable: TierTable): string[] {
	return [
		`<b>${tierTable.currency.symbol} volume tiers:</b>`,
		...tierTable.tiers.map((tier, i) => {
			const minVolume = formattedAmountWithUsd({
				amount: tier.minVolume,
				currency: tierTable.currency,
			})
			return `  Tier ${i + 1}: ≥${minVolume} → ${formatPercent(tier.feePercent)} of protocol fee`
		}),
	]
}

export class ReferralAboutPage {
	static render(tierTables: GetTierTablesResponseDtoOutput): PageContent {
		const lines = [
			'<b>How the referral system works</b>',
			'',
			'When someone uses your referral link and pays a protocol fee, you receive a share of that fee as a reward.',
			'',
			'<b>Fee share</b>',
			'Your fee share percentage is determined at the start of each 30-day period based on your total referred volume in the previous period.',
			'The higher your volume, the higher your tier and fee share.',
			'',
			'<b>Custom percent</b>',
			'If you have a custom fee percent set, it always takes priority over the tier-based percent.',
		]

		if (tierTables.tierTables.length > 0) {
			lines.push('', ...tierTables.tierTables.flatMap(tierTableLines))
		}

		return {
			message: messageFromLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.showReferral,
				home: actionIds.showHome,
			}),
		}
	}
}
