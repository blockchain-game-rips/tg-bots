import {
	GetReferrerResponseDtoOutput,
	GetTierTablesResponseDtoOutput,
} from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import {
	findNativeOnBase,
	hasClaimableReward,
} from '../../domain/referral-reward'
import { PageContent } from '../../types'
import { referralBreadcrumb } from '../../utils/display/breadcrumb'

const INTRO =
	'Invite friends and earn a share of Rips fees from referred activity.'
const HIGHEST_TIER_TEXT = "You're at the highest tier"
const TELEGRAM_SHARE_URL = 'https://t.me/share/url'

type State = GetReferrerResponseDtoOutput['states'][number]
type TierTable = GetTierTablesResponseDtoOutput['tierTables'][number]

export interface ReferralSystemPageArgs {
	referrerData: GetReferrerResponseDtoOutput
	tierTables: GetTierTablesResponseDtoOutput
	referralLink: string
}

export const ReferralSystemPage = {
	render(args: ReferralSystemPageArgs): PageContent {
		const { referrerData, tierTables, referralLink } = args

		const state = findNativeOnBase(referrerData.states, 'referrer state')
		const tierTable = findNativeOnBase(tierTables.tierTables, 'tier table')

		const toStateCurrencyAmount = (amount: string) => ({
			amount,
			currency: state.currency,
		})

		const lines: Line[] = [
			referralBreadcrumb(),
			'',
			INTRO,
			'',
			'Available to claim:',
			formatAmountWithUsd(toStateCurrencyAmount(state.rewards.available)),
			'',
			'Total claimed:',
			formatAmountWithUsd(toStateCurrencyAmount(state.rewards.withdrawn)),
			'',
			'Your referral tier:',
			formatPercent(state.fee),
			'',
			'This month referred volume:',
			formatAmountWithUsd(toStateCurrencyAmount(state.period.volume)),
			'',
			'Next tier:',
			nextTierText(state, tierTable),
		]

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(referralLink, hasClaimableReward(state)),
		}
	},
}

function nextTierText(state: State, tierTable: TierTable): string {
	const volume = BigInt(state.period.volume)

	// The API does not promise an ordering, so the next tier is the smallest
	// threshold above the current volume rather than the first one listed.
	const [nextTier] = tierTable.tiers
		.filter((tier) => BigInt(tier.minVolume) > volume)
		.sort((a, b) => (BigInt(a.minVolume) < BigInt(b.minVolume) ? -1 : 1))

	if (nextTier === undefined) return HIGHEST_TIER_TEXT

	const minVolume = formatAmountWithUsd({
		amount: nextTier.minVolume,
		currency: tierTable.currency,
	})

	return `Reach ${minVolume} monthly volume to unlock ${formatPercent(nextTier.feeBps)}`
}

function buildKeyboard(
	referralLink: string,
	isClaimable: boolean,
): InlineKeyboard {
	const shareUrl = `${TELEGRAM_SHARE_URL}?url=${encodeURIComponent(referralLink)}`

	const keyboard = new InlineKeyboard()
		.copyText('Copy Referral Link', referralLink)
		.row()
		.url('Share Referral Link', shareUrl)
		.row()

	if (isClaimable) {
		keyboard
			.text(
				'Claim Rewards',
				buildActionData(
					actionIds.openReferralWithdrawReward,
					undefined,
				),
			)
			.row()
	}

	return keyboard
		.text(
			'Referral Tiers',
			buildActionData(actionIds.openReferralAbout, undefined),
		)
		.appendNavButtons({
			parent: actionIds.openHome,
			home: actionIds.openHome,
		})
}
