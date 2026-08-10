import { PayoutDtoOutput, RipDtoOutput } from '@rips/api-client'
import { PageEntry, resolveVariant } from '@rips/grammy-kit'
import { resolveConfig, RipStatusGroup } from '@rips/shared'
import { BASE_CHAIN, SUPPORTED_CHAINS } from '../../src/constants'
import { buildCardCollection } from '../../src/domain/card-collection'
import { buildRevealSummary } from '../../src/domain/reveal-summary'
import { AboutPage } from '../../src/pages/about/about-page'
import { HomePage } from '../../src/pages/home-page'
import { GlobalCompletedRipPage } from '../../src/pages/notifications/global-completed-page'
import { GlobalRefundedRipPage } from '../../src/pages/notifications/global-refunded-page'
import { UserCompletedRipPage } from '../../src/pages/notifications/user-completed-page'
import { UserRefundedRipPage } from '../../src/pages/notifications/user-refunded-page'
import { WelcomePage } from '../../src/pages/onboarding/welcome-page'
import { CheckoutPage } from '../../src/pages/play/checkout-page'
import { EnterChooseEntryCountPage } from '../../src/pages/play/enter-choose-entry-count-page'
import { EnterPaymentOptionsPage } from '../../src/pages/play/enter-payment-options-page'
import { EnterChoosePresetPage } from '../../src/pages/play/enter-choose-preset-page'
import {
	EnterSuccessPage,
	EnterSuccessTransactions,
} from '../../src/pages/play/enter-success-page'
import { CardCollectionPage } from '../../src/pages/play/card-collection'
import { CardCollectionTierPage } from '../../src/pages/play/card-collection-tier'
import { FinalizedRipsPage } from '../../src/pages/play/finalized-rips-page'
import { OngoingRipsPage } from '../../src/pages/play/ongoing-rips-page'
import { RevealAllPage } from '../../src/pages/play/reveal-all-page'
import { RevealPayoutsPage } from '../../src/pages/play/reveal-payouts-page'
import {
	RipDetailPage,
	RipDetailVariant,
} from '../../src/pages/play/rip-detail-page'
import {
	RevealSinglePage,
	RevealSingleVariant,
} from '../../src/pages/play/reveal-single-page'
import { ViewPullsPage } from '../../src/pages/play/view-pulls-page'
import { MyRipsPage } from '../../src/pages/play/my-rips-page'
import {
	EnterChoosePaymentChainPage,
	EnterChoosePaymentTokenPage,
} from '../../src/pages/play/enter-choose-payment-chain-token-pages'
import { ZapFailedPage } from '../../src/pages/play/zap-failed-page'
import { ClaimRewardPage } from '../../src/pages/referral-system/claim-reward-page'
import { ReferralTiersPage } from '../../src/pages/referral-system/referral-tiers-page'
import { ReferralSystemPage } from '../../src/pages/referral-system/referral-system-page'
import { WithdrawRewardSuccessPage } from '../../src/pages/referral-system/withdraw-reward-success-page'
import { SwapCheckoutPage } from '../../src/pages/swap/swap-checkout-page'
import { SwapChooseAmountPage } from '../../src/pages/swap/swap-choose-amount-page'
import { SwapChooseDstChainPage } from '../../src/pages/swap/swap-choose-dst-chain-page'
import { SwapChooseDstTokenPage } from '../../src/pages/swap/swap-choose-dst-token-page'
import { SwapChooseSrcChainPage } from '../../src/pages/swap/swap-choose-src-chain-page'
import { SwapChooseSrcTokenPage } from '../../src/pages/swap/swap-choose-src-token-page'
import { SwapSuccessPage } from '../../src/pages/swap/swap-success-page'
import { DepositAddressPage } from '../../src/pages/wallet/deposit-address-page'
import { DepositChooseChainPage } from '../../src/pages/wallet/deposit-choose-chain-page'
import { DepositChooseCurrencyPage } from '../../src/pages/wallet/deposit-choose-currency-page'
import { ExportKeyPage } from '../../src/pages/wallet/export-key-page'
import { ExportKeyWarningPage } from '../../src/pages/wallet/export-key-warning-page'
import { WalletPage } from '../../src/pages/wallet/wallet-page'
import { WithdrawChooseAmountPage } from '../../src/pages/wallet/withdraw-choose-amount-page'
import { WithdrawChooseChainPage } from '../../src/pages/wallet/withdraw-choose-chain-page'
import { WithdrawChooseCurrencyPage } from '../../src/pages/wallet/withdraw-choose-currency-page'
import { WithdrawPage } from '../../src/pages/wallet/withdraw-page'
import { WithdrawSuccessPage } from '../../src/pages/wallet/withdraw-success-page'
import { addressQrInputFile } from '../../src/utils/qr'
import {
	mockAvailablePresetNoRip,
	mockAvailablePresets,
	mockAvailableReward,
	mockBalance,
	mockCardCollection,
	mockCardDefinitions,
	mockEntryCost,
	mockEthArbBalance,
	mockEthArbBalanceInsufficient,
	mockEthArbBalanceSufficient,
	mockEthArbNetworkFee,
	mockEthBalanceBelowRewardFee,
	mockEthBalanceCoveringRewardFee,
	mockFinalizedRips,
	mockOngoingAvailablePresets,
	mockOngoingRips,
	mockPaymentTokenBalances,
	mockPurchase,
	mockPurchaseQuote,
	mockReceiverAddress,
	mockReferrerData,
	mockRevealBatch,
	mockRevealBatchCapped,
	mockRevealBatchCollapsed,
	mockRevealPayoutCommon,
	mockRevealPayoutEpic,
	mockRevealPayoutMythic,
	mockPreRevealCollection,
	mockRevealedPayouts,
	mockRip,
	mockSufficientBalance,
	mockSwapCrosschainQuote,
	mockSwapCrosschainResponse,
	mockSwapCrosschainSuccessResult,
	mockSwapSamechainQuote,
	mockSwapSamechainResult,
	mockTierTables,
	mockUsdcArb,
	mockUsdcArbBalance,
	mockUsdcArbBalanceEmpty,
	mockUsdcArbWithdrawAmount,
	mockUsdcArbWithdrawAmountInsufficient,
	mockUsdcOnBase,
	mockUserEvmAddress,
	mockUserPrivateKey,
	mockViewPullsAllOpened,
	mockViewPullsPayouts,
	mockWalletBalances,
	mockWithdrawAmount,
	mockWithdrawRewardQuote,
	mockWithdrawRewardResponse,
	mockWithdrawTransaction,
	mockZapCurrencyInBalance,
	mockZapQuote,
	mockZapSamechainNativeBalance,
	mockZapSamechainQuote,
	mockZapSamechainSrcBalance,
	mockZapSamechainTransactionId,
	mockZapSrcBalanceInsufficient,
	mockZapSrcBalanceSufficient,
	mockZapSubmit,
	mockZapSuccessResult,
	mockZeroBalance,
} from './static-data'

const REFERRAL_FEE_BPS = 1000
const PULLS_COUNT = 8

const mockWithdrawCurrencies = [mockWithdrawAmount.currency]

const mockAvailablePreset0 = mockAvailablePresets[0]

if (mockAvailablePreset0 === undefined)
	throw new Error('mockAvailablePresets[0] is missing')

const OTHER_USER_ADDRESS = '0xabcdef1234567890abcdef1234567890abcdef12'

const MOCK_PLAY_LINK = 'https://t.me/RipsBot?start'

const [mockCompletedRip, mockRefundedRip] = mockFinalizedRips

if (mockCompletedRip === undefined || mockRefundedRip === undefined)
	throw new Error('mockFinalizedRips is missing a completed or refunded rip')

function purchase(
	userAddress: string,
	entryCount: number,
	startEntryIndex: number,
) {
	return { userAddress, entryCount, startEntryIndex }
}

function mockRipWith(overrides: Partial<RipDtoOutput>): RipDtoOutput {
	return { ...mockRip, ...overrides }
}

// Direct and samechain both settle in a single Base transaction, so they share
// a shape and differ only in which token was spent to get there.
function mockTransactions(variant: string): EnterSuccessTransactions {
	if (variant === 'crosschain')
		return {
			kind: 'crosschain',
			srcChain: mockZapSubmit.amountIn.currency.chainAddress.chain,
			srcTransactionId: mockZapSubmit.srcTransaction.id,
			dstChain: BASE_CHAIN,
			dstTransactionId: mockZapSuccessResult.dstTransaction.id,
		}

	const transactionId =
		variant === 'samechain'
			? mockZapSamechainTransactionId
			: mockPurchase.transaction.id

	return { kind: 'singleChain', transactionId }
}

function mockRipDetailVariant(variant: string): RipDetailVariant {
	const userAddress = mockUserEvmAddress

	switch (variant) {
		case 'completing':
			return {
				group: RipStatusGroup.COMPLETING,
				userAddress,
				rip: mockRipWith({
					status: 'VRF_REQUESTED',
					actions: {
						purchases: [purchase(userAddress, 8, 0)],
						claims: [],
						refunds: [],
					},
				}),
			}

		case 'completed':
			return {
				group: RipStatusGroup.COMPLETED,
				userAddress,
				payouts: mockRevealedPayouts,
				rip: mockRipWith({
					status: 'CLAIMED',
					actions: {
						purchases: [purchase(userAddress, 8, 0)],
						claims: [],
						refunds: [],
					},
				}),
			}

		case 'refunding':
			return {
				group: RipStatusGroup.REFUNDING,
				userAddress,
				rip: mockRipWith({
					status: 'REFUNDING',
					actions: {
						purchases: [
							purchase(userAddress, 3, 0),
							purchase(OTHER_USER_ADDRESS, 2, 3),
						],
						claims: [],
						refunds: [],
					},
				}),
			}

		case 'refunded':
			return {
				group: RipStatusGroup.REFUNDED,
				userAddress,
				rip: mockRipWith({
					status: 'REFUNDED',
					actions: {
						purchases: [purchase(userAddress, 3, 0)],
						claims: [],
						refunds: [{ userAddress, amount: '15000000000000000' }],
					},
				}),
			}

		default:
			return {
				group: RipStatusGroup.FILLING,
				userAddress,
				rip: mockRipWith({
					status: 'FILLING',
					startTime: new Date().toISOString(),
					actions: {
						purchases: [purchase(userAddress, 5, 0)],
						claims: [],
						refunds: [],
					},
				}),
			}
	}
}

function viewPullsPayoutsFor(variant: string): PayoutDtoOutput[] {
	switch (variant) {
		case 'all-opened':
			return mockViewPullsAllOpened

		case 'empty':
			return []

		default:
			return mockViewPullsPayouts
	}
}

function revealBatchFor(variant: string): PayoutDtoOutput[] {
	switch (variant) {
		case 'collapsed-duplicates':
			return mockRevealBatchCollapsed

		case 'capped':
			return mockRevealBatchCapped

		default:
			return mockRevealBatch
	}
}

const MOCK_COLLECTION_PROGRESS = { collected: 39, total: 151 }
const MOCK_UNOPENED_REMAINING = 7
const MOCK_COPIES_OWNED = 4
const NO_PULLS_LEFT = 0

function revealSingleVariantFor(variant: string): RevealSingleVariant {
	const base = {
		rip: mockRip,
		revealedPayout: mockRevealPayoutCommon,
		unopenedCount: MOCK_UNOPENED_REMAINING,
		isNew: false,
		collectionProgress: MOCK_COLLECTION_PROGRESS,
		copiesOwned: MOCK_COPIES_OWNED,
	}

	switch (variant) {
		case 'mythic':
			return {
				...base,
				revealedPayout: mockRevealPayoutMythic,
				isNew: true,
			}

		case 'last-pull':
			return {
				...base,
				revealedPayout: mockRevealPayoutEpic,
				unopenedCount: NO_PULLS_LEFT,
			}

		default:
			return base
	}
}

export const pages: Record<string, PageEntry> = {
	home: {
		description:
			'Home page. Adapts to user state: new user (no funds, prompts to fund), funded (prompts to enter a Rip), or pulls (prompts to open unopened pulls).',
		variants: ['new-user', 'funded', 'pulls'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			const baseBalance =
				resolvedVariant === 'new-user'
					? mockZeroBalance
					: mockSufficientBalance

			const unopenedPulls = resolvedVariant === 'pulls' ? PULLS_COUNT : 0

			return HomePage.render({
				unopenedPulls,
				baseBalance,
				referralFee: REFERRAL_FEE_BPS,
			})
		},
	},
	'card-collection': {
		description:
			'Summary of the card collection — grand total, per-tier progress, and a button per tier to drill in.',
		render: () =>
			CardCollectionPage.render(
				buildCardCollection(mockCardDefinitions, mockCardCollection),
			),
	},
	'card-collection-tier': {
		description:
			'One tier of the collection — collected cards as image links first, then locked "Unknown" slots.',
		render: () => {
			const collection = buildCardCollection(
				mockCardDefinitions,
				mockCardCollection,
			)

			const COMMON_TIER_NAME = 'Common'

			const tier = collection.tiers.find(
				(t) => t.tier.name === COMMON_TIER_NAME,
			)

			if (tier === undefined) throw new Error('Common tier not found')

			return CardCollectionTierPage.render(tier)
		},
	},
	'enter-choose-preset': {
		description:
			'First step of entering. Shows available preset tiers to pick from. Opened from Play.',
		render: () => EnterChoosePresetPage.render(mockAvailablePresets),
	},
	'enter-choose-entry-count': {
		description:
			'Second step of entering. Choose how many entries: preset options or custom amount. The "no-rip" variant shows a preset with no filling rip yet (entry starts one) rather than one joining an in-progress rip with a refund warning.',
		variants: ['default', 'no-rip'],
		render(variant) {
			const availablePreset =
				resolveVariant(this, variant) === 'no-rip'
					? mockAvailablePresetNoRip
					: mockAvailablePreset0

			return EnterChooseEntryCountPage.renderFreshDraft(availablePreset)
		},
	},
	'enter-payment-options': {
		description:
			'Between choose-entry-count and checkout. Choose which currency to pay with. Base ETH is always offered because it enters the game directly, even at zero balance; every other currency the player holds a non-zero balance in is listed under its chain. "Pay from another chain" reaches funds the shortlist does not cover.',
		render: () =>
			EnterPaymentOptionsPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 8,
				balances: mockPaymentTokenBalances,
			}),
	},
	checkout: {
		description:
			'Unified checkout for all payment paths. "direct-*" pays Base ETH straight into the game (no bridge header, no "Receive on" line). "crosschain-*" pays from Arbitrum and bridges to Base (bridge cost + time). "samechain-sufficient" pays a non-native token on Base (network fee only). Confirm when funds cover everything; otherwise per-currency "Not enough" blocks with Deposit buttons replace Confirm. Every variant offers Change entry count and Change payment token. The two crosschain-insufficient variants differ by which balance is short: "amount" (the source token) or "native" (gas for fees).',
		variants: [
			'direct-sufficient',
			'direct-insufficient',
			'crosschain-sufficient',
			'crosschain-insufficient-amount',
			'crosschain-insufficient-native',
			'samechain-sufficient',
		],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			if (resolvedVariant === 'direct-sufficient') {
				return CheckoutPage.render({
					availablePreset: mockAvailablePreset0,
					entryCount: 3,
					srcBalance: mockSufficientBalance,
					nativeBalance: mockSufficientBalance,
					quote: {
						kind: 'direct',
						amountIn: mockEntryCost,
						quote: mockPurchaseQuote,
					},
				})
			}

			if (resolvedVariant === 'direct-insufficient') {
				return CheckoutPage.render({
					availablePreset: mockAvailablePreset0,
					entryCount: 3,
					srcBalance: mockBalance,
					nativeBalance: mockBalance,
					quote: {
						kind: 'direct',
						amountIn: mockEntryCost,
						quote: mockPurchaseQuote,
					},
				})
			}

			if (resolvedVariant === 'samechain-sufficient') {
				return CheckoutPage.render({
					availablePreset: mockAvailablePreset0,
					entryCount: 3,
					srcBalance: mockZapSamechainSrcBalance,
					nativeBalance: mockZapSamechainNativeBalance,
					quote: { kind: 'samechain', quote: mockZapSamechainQuote },
				})
			}

			const srcBalance =
				resolvedVariant === 'crosschain-insufficient-amount'
					? mockZapSrcBalanceInsufficient
					: mockZapSrcBalanceSufficient

			const nativeBalance =
				resolvedVariant === 'crosschain-insufficient-native'
					? mockEthArbBalanceInsufficient
					: mockEthArbBalanceSufficient

			return CheckoutPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				srcBalance,
				nativeBalance,
				quote: { kind: 'crosschain', quote: mockZapQuote },
			})
		},
	},
	'enter-success': {
		description:
			'Final step of the enter flow, one variant per payment route. Confirms a successful entry — shows rip number, entry count, entry total, fill status, and the transaction. "direct" and "samechain" settle in a single transaction on Base; "crosschain" bridges, so it shows a transaction on each chain.',
		variants: ['direct', 'samechain', 'crosschain'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			const config = resolveConfig(mockAvailablePreset0)

			return EnterSuccessPage.render({
				entryPrice: config.entryPrice,
				entryCap: config.entryCap,
				filledEntries:
					mockPurchase.startEntryIndex + mockPurchase.entryCount,
				ripId: mockPurchase.ripId,
				entryCount: mockPurchase.entryCount,
				transactions: mockTransactions(resolvedVariant),
			})
		},
	},
	'enter-choose-payment-chain': {
		description:
			'Reached from "Pay from another chain" on the payment token page. Choose which chain to pay from; a token picker on that chain follows.',
		render: () =>
			EnterChoosePaymentChainPage.render({
				availablePreset: mockAvailablePreset0,
			}),
	},
	'enter-choose-payment-token': {
		description:
			'Second step of paying from another chain. Choose a token on the chosen chain to pay with.',
		render: () =>
			EnterChoosePaymentTokenPage.render({
				availablePreset: mockAvailablePreset0,
				currencies: [mockZapCurrencyInBalance.currency],
			}),
	},
	'zap-failed': {
		description:
			'Shown when the zap transaction fails. Shows preset, entry count, amount paid, and refund amount.',
		render: () =>
			ZapFailedPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				amountIn: mockZapCurrencyInBalance,
				refund: mockZapCurrencyInBalance,
			}),
	},
	'my-rips': {
		description:
			"Summary of the user's activity — ready-to-open pulls, active entries, and finalized rip counts split into completed and refunded, with navigation to Open Pulls, Ongoing Rips and Finalized Rips.",
		render: () =>
			MyRipsPage.render({
				unopenedPulls: 8,
				activeEntries: 0,
				completedRips: 3,
				refundedRips: 1,
			}),
	},
	'rip-detail': {
		description:
			'Individual rip detail — one page, five variants by RipStatusGroup. All variants share Status, Entry level, Your entries and Total entries. FILLING adds time left and an Enter Rip button. COMPLETING shows a "pulls being prepared" notice. COMPLETED adds your pulls, total credited and best pull, with View Pulls and Enter Again. REFUNDING shows the expected refund as in progress; REFUNDED shows the returned amount and offers Enter Again.',
		variants: [
			'filling',
			'completing',
			'completed',
			'refunding',
			'refunded',
		],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			return RipDetailPage.render(mockRipDetailVariant(resolvedVariant))
		},
	},
	'view-pulls': {
		description:
			'History of what the user got out of one finalized rip, opened from rip detail. Lists every pull they bought: opened ones show the card name linked to its image, its tier emoji and payout; unopened ones show only a locked row. Opened counts revealed against total, Total credited sums every payout whether opened or not, and Best pull names the largest opened payout. Revealed pulls sort by tier then payout, locked pulls last. Open Pulls appears only while something is unopened; Back returns to the rip.',
		variants: ['partially-opened', 'all-opened', 'empty'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			return ViewPullsPage.render({
				rip: mockRip,
				payouts: viewPullsPayoutsFor(resolvedVariant),
			})
		},
	},
	'ongoing-rips': {
		description:
			'All rips that have not finalized, plus every preset with no filling rip. Ready presets come first with an Enter button each, then filling rips, then completing and refunding ones. Each rip shows entry level, entries sold against the cap and status, with time left on filling rips only, and a Details button. Back leads to My Rips.',
		render: () =>
			OngoingRipsPage.render({
				availablePresets: mockOngoingAvailablePresets,
				ongoingRips: mockOngoingRips,
			}),
	},
	'finalized-rips': {
		description:
			'The last 10 finalized rips, each showing entry level, entry cap (completed rips only), and outcome. Defaults to all users’ rips with a "Show Mine" toggle. Each rip has a Details button. Back leads to My Rips.',
		render: () => FinalizedRipsPage.render(mockFinalizedRips, false),
	},
	'reveal-payouts': {
		description:
			'The Open Pulls hub ("Open Pulls" in the Play menu). States the unopened count in words and explains what a pull reveals, offering Reveal Next / Reveal All. The "empty" variant drops the reveal buttons for Enter Rips so the page is not a dead end. Part of a 3-page reveal flow that behaves as one screen — back leads to Play.',
		variants: ['has-pulls', 'empty'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			if (resolvedVariant === 'empty')
				return RevealPayoutsPage.render(NO_PULLS_LEFT)

			return RevealPayoutsPage.render(PULLS_COUNT)
		},
	},
	'reveal-single': {
		description:
			'The result of opening one pull, led by the tier headline. Shows the card, the payout in ETH with a USD approximation, whether the card is new or a duplicate, and then either collection progress (new cards only) or copies owned (duplicates only). "mythic" adds flavour copy; "last-pull" replaces the reveal buttons with Enter Rips. Reached from the hub or from another result — back leads to Play.',
		variants: ['duplicate', 'mythic', 'last-pull'],
		render(variant) {
			return RevealSinglePage.render(
				revealSingleVariantFor(resolveVariant(this, variant)),
			)
		},
	},
	'reveal-all': {
		description:
			'The Reveal All summary: how many pulls were opened, the best pull and its payout, total credited, new-vs-duplicate counts, and every card grouped under its tier. Totals carry a USD approximation; grouped rows are ETH-only. "collapsed-duplicates" shows same-card rows collapsed into one row with a count and summed payout; "capped" overflows the 30-row cap and shows the "…and N more" line.',
		variants: ['default', 'collapsed-duplicates', 'capped'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			return RevealAllPage.render({
				currency: mockRip.currency,
				summary: buildRevealSummary(
					buildCardCollection(
						mockCardDefinitions,
						mockPreRevealCollection,
					),
					revealBatchFor(resolvedVariant),
				),
			})
		},
	},
	'withdraw-choose-chain': {
		description:
			'First step of the withdraw flow. Choose a chain to withdraw from.',
		render: () => WithdrawChooseChainPage.render(),
	},
	'withdraw-choose-currency': {
		description:
			'Second step of the withdraw flow. Choose a currency on the selected chain.',
		render: () => WithdrawChooseCurrencyPage.render(mockWithdrawCurrencies),
	},
	'withdraw-choose-amount': {
		description:
			'Third step of the withdraw flow. Choose amount — max or custom.',
		render: () => WithdrawChooseAmountPage.render(mockBalance),
	},
	withdraw: {
		description:
			'Withdraw page. USDC on Arbitrum. One page across the whole withdrawal: collects amount and recipient, then quotes and confirms. Empty fields read "Not set"; the fee line appears only once quoted.',
		variants: [
			'incomplete',
			'zero-balance',
			'ready',
			'insufficient-token',
			'insufficient-native',
		],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			if (resolvedVariant === 'incomplete') {
				return WithdrawPage.render({
					kind: 'pending',
					currencyBalance: mockUsdcArbBalance,
				})
			}

			if (resolvedVariant === 'zero-balance') {
				return WithdrawPage.render({
					kind: 'pending',
					currencyBalance: mockUsdcArbBalanceEmpty,
				})
			}

			const currencyAmount =
				resolvedVariant === 'insufficient-token'
					? mockUsdcArbWithdrawAmountInsufficient
					: mockUsdcArbWithdrawAmount

			const nativeBalance =
				resolvedVariant === 'insufficient-native'
					? mockEthArbBalanceInsufficient
					: mockEthArbBalance

			return WithdrawPage.render({
				kind: 'quoted',
				currencyBalance: mockUsdcArbBalance,
				nativeBalance,
				amount: BigInt(currencyAmount.amount),
				withdrawQuote: { blockchainFee: mockEthArbNetworkFee },
				recipientAddress: mockReceiverAddress,
			})
		},
	},
	'withdraw-success': {
		description:
			'Confirms a successful withdrawal — shows transaction ID. Opened after withdraw-confirm.',
		render: () =>
			WithdrawSuccessPage.render({
				transaction: mockWithdrawTransaction,
				currencyAmount: mockUsdcArbWithdrawAmount,
				blockchainFee: mockEthArbNetworkFee,
				recipientAddress: mockReceiverAddress,
			}),
	},
	wallet: {
		description:
			"Wallet hub. Shows the user's balances across all supported chains (natives always shown, non-zero tokens beneath), with navigation to Deposit, Withdraw and Swap. Opened from Home.",
		render: () => WalletPage.render(mockWalletBalances),
	},
	'export-key-warning': {
		description:
			'Warning shown before revealing the private key. Explains that anyone holding the key controls the wallet and that support never asks for it. Confirming opens export-key. Opened from Wallet.',
		render: () => ExportKeyWarningPage.render(),
	},
	'export-key': {
		description:
			'Shows the wallet private key as tap-to-copy text and asks the user to delete the message once saved. Opened from export-key-warning.',
		render: () => ExportKeyPage.render(mockUserPrivateKey),
	},
	'deposit-choose-chain': {
		description:
			'First step of the deposit flow. Choose a chain to deposit to. Opened from Wallet.',
		render: () => DepositChooseChainPage.render(),
	},
	'deposit-choose-currency': {
		description:
			'Second step of the deposit flow. Choose a currency on the selected chain.',
		render: () => DepositChooseCurrencyPage.render(mockWithdrawCurrencies),
	},
	'deposit-address': {
		description:
			'Final step of the deposit flow. Shows the deposit address (tap-to-copy) and the current balance of the chosen token, plus a warning about unsupported assets. Refresh re-fetches the balance. The "qr" variant shows the same page as a photo message with a scannable QR of the address.',
		variants: ['text', 'qr'],
		async render(variant) {
			const qr =
				variant === 'qr'
					? await addressQrInputFile(mockUserEvmAddress)
					: undefined

			return DepositAddressPage.render({
				balance: mockBalance,
				depositAddress: mockUserEvmAddress,
				qr,
			})
		},
	},
	'swap-choose-src-chain': {
		description:
			'First step of the swap flow. Choose a source chain. The "fresh-draft" variant is opened from Wallet and starts a new swap; the "draft-edit" variant is opened from swap checkout via Change Source and shows the already chosen destination and amount, back leads to checkout.',
		variants: ['fresh-draft', 'draft-edit'],
		render(variant) {
			const chains = [...SUPPORTED_CHAINS]

			if (resolveVariant(this, variant) === 'fresh-draft')
				return SwapChooseSrcChainPage.renderFreshDraft({ chains })

			return SwapChooseSrcChainPage.renderDraftEdit({
				chains,
				srcCurrency: mockUsdcArb,
				dstCurrency: mockUsdcArb,
				amountIn: BigInt(mockUsdcArbWithdrawAmount.amount),
			})
		},
	},
	'swap-choose-src-token': {
		description:
			'Second step of the swap flow. Choose a source token on the already chosen source chain. The "fresh-draft" variant is opened from choose-src-chain and shows only the source chain; the "draft-edit" variant is opened from swap checkout via Change Source and also shows the chosen destination and amount, back leads to checkout.',
		variants: ['fresh-draft', 'draft-edit'],
		render(variant) {
			const srcChain = mockUsdcArb.chainAddress.chain
			const currencies = [mockUsdcArb, ...mockWithdrawCurrencies]

			if (resolveVariant(this, variant) === 'fresh-draft')
				return SwapChooseSrcTokenPage.renderFreshDraft({
					srcChain,
					currencies,
				})

			return SwapChooseSrcTokenPage.renderDraftEdit({
				srcChain,
				currencies,
				srcCurrency: mockUsdcArb,
				dstCurrency: mockUsdcArb,
				amountIn: BigInt(mockUsdcArbWithdrawAmount.amount),
			})
		},
	},
	'swap-choose-dst-chain': {
		description:
			'Third step of the swap flow. Choose a destination chain. The "fresh-draft" variant is opened from choose-src-token and shows the source token plus its balance, back leads to choose-src-token. The "draft-edit" variant is opened from swap checkout via Change Destination and also shows the chosen amount, back leads to checkout.',
		variants: ['fresh-draft', 'draft-edit'],
		render(variant) {
			const srcBalance = mockUsdcArbWithdrawAmount
			const dstChains = [...SUPPORTED_CHAINS]

			if (resolveVariant(this, variant) === 'fresh-draft')
				return SwapChooseDstChainPage.renderFreshDraft({
					srcBalance,
					dstChains,
				})

			return SwapChooseDstChainPage.renderDraftEdit({
				srcBalance,
				dstChains,
				amountIn: BigInt(mockUsdcArbWithdrawAmount.amount),
			})
		},
	},
	'swap-choose-dst-token': {
		description:
			'Fourth step of the swap flow. Choose a destination token on the already chosen destination chain. The "fresh-draft" variant is opened from choose-dst-chain and shows the source token, destination chain and source balance, back leads to choose-dst-chain. The "draft-edit" variant is opened from swap checkout via Change Destination and also shows the chosen amount, back leads to checkout.',
		variants: ['fresh-draft', 'draft-edit'],
		render(variant) {
			const srcBalance = mockUsdcArbWithdrawAmount
			const dstChain = mockUsdcArb.chainAddress.chain
			const dstCurrencies = [mockUsdcArb, ...mockWithdrawCurrencies]

			if (resolveVariant(this, variant) === 'fresh-draft')
				return SwapChooseDstTokenPage.renderFreshDraft({
					srcBalance,
					dstChain,
					dstCurrencies,
				})

			return SwapChooseDstTokenPage.renderDraftEdit(
				{ srcBalance, dstChain, dstCurrencies },
				BigInt(mockUsdcArbWithdrawAmount.amount),
			)
		},
	},
	'swap-choose-amount': {
		description:
			'Fifth step of the swap flow. Choose how much to swap via Max or Custom amount. The "fresh-draft" variant is opened from choose-dst-token, back leads to choose-dst-token. The "draft-edit" variant is opened from swap checkout via Change Amount, back leads to checkout. Both show the source and destination tokens plus the source balance.',
		variants: ['fresh-draft', 'draft-edit'],
		render(variant) {
			const draft = {
				srcBalance: mockUsdcArbWithdrawAmount,
				dstCurrency: mockUsdcArb,
			}

			if (resolveVariant(this, variant) === 'fresh-draft')
				return SwapChooseAmountPage.renderFreshDraft(draft)

			return SwapChooseAmountPage.renderDraftEdit(draft)
		},
	},
	'swap-checkout': {
		description:
			'Final step of the swap flow. Shows the quote: amount, estimated receive, fees, and source balance. Confirm if funds cover the amount and fees; otherwise a warning replaces Confirm. The "crosschain-*" variants swap across chains (Arbitrum → Base) and show estimated time plus a bridge fee; the "samechain-sufficient" variant swaps on one chain with only a network fee. The two crosschain-insufficient variants differ by which balance is short: "amount" suggests entering a smaller amount, "native" warns there is not enough gas.',
		variants: [
			'crosschain-sufficient',
			'crosschain-insufficient-amount',
			'crosschain-insufficient-native',
			'samechain-sufficient',
		],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			const isSamechain = resolvedVariant === 'samechain-sufficient'

			const amountIn =
				resolvedVariant === 'crosschain-insufficient-amount'
					? mockUsdcArbWithdrawAmountInsufficient
					: mockUsdcArbWithdrawAmount

			const nativeBalance =
				resolvedVariant === 'crosschain-insufficient-native'
					? mockEthArbBalanceInsufficient
					: mockEthArbBalanceSufficient

			if (isSamechain) {
				return SwapCheckoutPage.render({
					srcBalance: mockUsdcArbBalance,
					nativeBalance,
					dstCurrency: mockUsdcArb,
					amountIn: BigInt(amountIn.amount),
					quote: { kind: 'samechain', quote: mockSwapSamechainQuote },
				})
			}

			return SwapCheckoutPage.render({
				srcBalance: mockUsdcArbBalance,
				nativeBalance,
				dstCurrency: mockUsdcOnBase,
				amountIn: BigInt(amountIn.amount),
				quote: { kind: 'crosschain', quote: mockSwapCrosschainQuote },
			})
		},
	},
	'swap-success': {
		description:
			'Final step of the swap flow. Confirms the swap succeeded — shows amount received, network fee, and transaction hashes. The "samechain" variant shows a single transaction; the "crosschain" variant shows one transaction per chain (source and destination).',
		variants: ['crosschain', 'samechain'],
		render(variant) {
			if (resolveVariant(this, variant) === 'samechain')
				return SwapSuccessPage.render({
					kind: 'samechain',
					result: mockSwapSamechainResult,
				})

			return SwapSuccessPage.render({
				kind: 'crosschain',
				swapResponse: mockSwapCrosschainResponse,
				result: mockSwapCrosschainSuccessResult,
			})
		},
	},
	'referral-system': {
		description:
			'Main referral dashboard. Shows available/withdrawn rewards, current fee share, monthly volume, tier table, and links to copy referral link, withdraw rewards, and learn more.',
		render: () =>
			ReferralSystemPage.render({
				referrerData: mockReferrerData,
				tierTables: mockTierTables,
				referralLink: 'https://t.me/rips_bot?start=ref_abc123',
			}),
	},
	'referral-tiers': {
		description:
			'Explains how the referral system works: fee share tiers based on 30-day volume, custom percent override. Back leads to referral-system.',
		render: () => ReferralTiersPage.render(mockTierTables),
	},
	'referral-claim': {
		description:
			'Claim page. Confirms claiming referral rewards — always shows the available reward, the blockchain fee and the Base ETH balance. The amount is never chosen: the whole available reward goes to the user\'s own wallet. "sufficient" offers Claim; "insufficient-native" replaces it with a Deposit button and warns that Base ETH cannot cover the fee. Back leads to referral-system.',
		variants: ['sufficient', 'insufficient-native'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			const nativeBalance =
				resolvedVariant === 'insufficient-native'
					? mockEthBalanceBelowRewardFee
					: mockEthBalanceCoveringRewardFee

			return ClaimRewardPage.render({
				reward: mockAvailableReward,
				nativeBalance,
				blockchainFee: mockWithdrawRewardQuote.blockchainFee,
			})
		},
	},
	'referral-withdraw-success': {
		description:
			'Confirms a successful reward claim — shows amount, blockchain fee, and the transaction id. Home is the only navigation.',
		render: () =>
			WithdrawRewardSuccessPage.render(mockWithdrawRewardResponse),
	},
	'onboarding-welcome': {
		description:
			'First page a new user sees instead of Home. Offers a permanent choice between generating a fresh wallet and importing a private key.',
		render: () => WelcomePage.render(),
	},
	about: {
		description:
			'Explains how the game works and lists every entry level. Each level shows its name, entry price (with USD equivalent), fill window, and entries to fill. Closes with the card/payout nature and the referral compliance notice.',
		render: () => AboutPage.render(mockAvailablePresets),
	},
	'notification-user-completed': {
		description:
			'Push sent to a participant when their Rip completes. Announces the result and links straight to the reveal hub.',
		render: () => UserCompletedRipPage.render(mockCompletedRip),
	},
	'notification-user-refunded': {
		description:
			'Push sent to a participant when their Rip is refunded. Confirms the funds are back in the wallet and links to it.',
		render: () => UserRefundedRipPage.render(mockRefundedRip),
	},
	'notification-global-completed': {
		description:
			'Broadcast announcing a completed Rip to the group. Links into the bot so onlookers can start playing.',
		render: () =>
			GlobalCompletedRipPage.render({
				rip: mockCompletedRip,
				playLink: MOCK_PLAY_LINK,
			}),
	},
	'notification-global-refunded': {
		description:
			'Broadcast announcing a refunded Rip to the group. Links into the bot so onlookers can start playing.',
		render: () =>
			GlobalRefundedRipPage.render({
				rip: mockRefundedRip,
				playLink: MOCK_PLAY_LINK,
			}),
	},
}
