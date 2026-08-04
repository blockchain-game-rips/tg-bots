import {
	ChainAddressDto,
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
import { NATIVE_ON_BASE } from '../../constants'
import { PageContent } from '../../types'
import { isSameChainAddress } from '../../utils/currency'

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
			fmt`👥 ${FormattedString.b('Referrals')}`,
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
			keyboard: buildKeyboard(referralLink),
		}
	},
}

// The referral system only ever pays out in native currency on Base, so the
// page reads that entry rather than whichever one happens to come first.
// A missing entry is a broken API contract, not a state a user can reach.
function findNativeOnBase<
	T extends { currency: { chainAddress: ChainAddressDto } },
>(candidates: T[], description: string): T {
	const match = candidates.find((candidate) =>
		isSameChainAddress(candidate.currency.chainAddress, NATIVE_ON_BASE),
	)

	if (match === undefined) {
		throw new Error(`No ${description} for native currency on Base`)
	}

	return match
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

function buildKeyboard(referralLink: string): InlineKeyboard {
	const shareUrl = `${TELEGRAM_SHARE_URL}?url=${encodeURIComponent(referralLink)}`

	return new InlineKeyboard()
		.copyText('Copy Referral Link', referralLink)
		.row()
		.url('Share Referral Link', shareUrl)
		.row()
		.text(
			'Claim Rewards',
			buildActionData(actionIds.openReferralWithdrawReward, undefined),
		)
		.row()
		.text(
			'Referral Tiers',
			buildActionData(actionIds.openReferralAbout, undefined),
		)
		.appendNavButtons({
			parent: actionIds.openHome,
			home: actionIds.openHome,
		})
}
