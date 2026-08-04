import { PayoutDto, RipDto } from '@rips/api-client'
import { PageEntry, resolveVariant } from '@rips/grammy-kit'
import { RipStatusGroup } from '@rips/shared'
import { SUPPORTED_CHAINS } from '../../src/constants'
import { buildCardCollection } from '../../src/domain/card-collection'
import { AboutPage } from '../../src/pages/about/about-page'
import { HomePage } from '../../src/pages/home-page'
import { CheckoutPage } from '../../src/pages/play/checkout-page'
import { EnterChooseEntryCountPage } from '../../src/pages/play/enter-choose-entry-count-page'
import { EnterChoosePaymentWalletPage } from '../../src/pages/play/enter-choose-payment-wallet-page'
import { EnterChoosePresetPage } from '../../src/pages/play/enter-choose-preset-page'
import { EnterSuccessPage } from '../../src/pages/play/enter-success-page'
import { CardCollectionPage } from '../../src/pages/play/card-collection'
import { CardCollectionTierPage } from '../../src/pages/play/card-collection-tier'
import { FinishedRipsPage } from '../../src/pages/play/finished-rips-page'
import { OngoingRipsPage } from '../../src/pages/play/ongoing-rips-page'
import { RevealAllPage } from '../../src/pages/play/reveal-all-page'
import { RevealPayoutsPage } from '../../src/pages/play/reveal-payouts-page'
import {
	RipDetailPage,
	RipDetailVariant,
} from '../../src/pages/play/rip-detail-page'
import { RevealSinglePage } from '../../src/pages/play/reveal-single-page'
import { ViewPullsPage } from '../../src/pages/play/view-pulls-page'
import { MyRipsPage } from '../../src/pages/play/my-rips-page'
import { ZapChooseChainPage } from '../../src/pages/play/zap-choose-chain-page'
import { ZapChooseTokenPage } from '../../src/pages/play/zap-choose-token-page'
import { ZapFailedPage } from '../../src/pages/play/zap-failed-page'
import { ReferralAboutPage } from '../../src/pages/referral-system/referral-about-page'
import { ReferralSystemPage } from '../../src/pages/referral-system/referral-system'
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
import { WalletPage } from '../../src/pages/wallet/wallet-page'
import { WithdrawCheckoutPage } from '../../src/pages/wallet/withdraw-checkout-page'
import { WithdrawChooseAmountPage } from '../../src/pages/wallet/withdraw-choose-amount-page'
import { WithdrawChooseChainPage } from '../../src/pages/wallet/withdraw-choose-chain-page'
import { WithdrawChooseCurrencyPage } from '../../src/pages/wallet/withdraw-choose-currency-page'
import { WithdrawPage } from '../../src/pages/wallet/withdraw-page'
import { WithdrawSuccessPage } from '../../src/pages/wallet/withdraw-success-page'
import { addressQrInputFile } from '../../src/utils/qr'
import {
	mockAvailablePresetNoRip,
	mockAvailablePresets,
	mockBalance,
	mockCardCollection,
	mockCardDefinitions,
	mockConfigs,
	mockEntryCost,
	mockEthArbBalance,
	mockEthArbBalanceInsufficient,
	mockEthArbBalanceSufficient,
	mockEthArbNetworkFee,
	mockFinishedRips,
	mockPaymentWalletBalances,
	mockPurchase,
	mockPurchaseQuote,
	mockReceiverAddress,
	mockReferrerData,
	mockRevealedPayouts,
	mockRip,
	mockRip2,
	mockSufficientBalance,
	mockSwapCrosschainQuote,
	mockSwapCrosschainResponse,
	mockSwapCrosschainSuccessResult,
	mockSwapSamechainQuote,
	mockSwapSamechainResult,
	mockTierTables,
	mockUnrevealedPayouts,
	mockUsdcArb,
	mockUsdcArbBalance,
	mockUsdcArbWithdrawAmount,
	mockUsdcArbWithdrawAmountInsufficient,
	mockUsdcOnBase,
	mockUserEvmAddress,
	mockViewPullsAllOpened,
	mockViewPullsPayouts,
	mockWalletBalances,
	mockWithdrawAmount,
	mockWithdrawRewardResponse,
	mockWithdrawTransaction,
	mockZapCurrencyInBalance,
	mockZapQuote,
	mockZapSamechainNativeBalance,
	mockZapSamechainQuote,
	mockZapSamechainSrcBalance,
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
const mockRevealedPayout0 = mockRevealedPayouts[0]

if (mockAvailablePreset0 === undefined)
	throw new Error('mockAvailablePresets[0] is missing')
if (mockRevealedPayout0 === undefined)
	throw new Error('mockRevealedPayouts[0] is missing')

const OTHER_USER_ADDRESS = '0xabcdef1234567890abcdef1234567890abcdef12'

function purchase(
	userAddress: string,
	entryCount: number,
	startEntryIndex: number,
) {
	return { userAddress, entryCount, startEntryIndex }
}

function mockRipWith(overrides: Partial<RipDto>): RipDto {
	return { ...mockRip, ...overrides }
}

function mockRipDetailVariant(variant: string): RipDetailVariant {
	const userAddress = mockUserEvmAddress

	switch (variant) {
		case 'finalizing':
			return {
				group: RipStatusGroup.FINALIZING,
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

		case 'finalized':
			return {
				group: RipStatusGroup.FINALIZED,
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

function viewPullsPayoutsFor(variant: string): PayoutDto[] {
	switch (variant) {
		case 'all-opened':
			return mockViewPullsAllOpened

		case 'empty':
			return []

		default:
			return mockViewPullsPayouts
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
			'Second step of entering. Choose how many entries: preset options or custom amount. Opened from choose-preset. The "no-rip" variant has no filling rip yet (entry starts one); the "filling" variant joins an in-progress rip and shows time left with a refund warning.',
		variants: ['no-rip', 'filling'],
		render(variant) {
			const availablePreset =
				resolveVariant(this, variant) === 'no-rip'
					? mockAvailablePresetNoRip
					: mockAvailablePreset0

			return EnterChooseEntryCountPage.render(availablePreset)
		},
	},
	'enter-choose-payment-wallet': {
		description:
			'Between choose-entry-count and checkout. Choose which wallet to pay from. Always shows Base ETH (native base) plus any funded chain — a native non-base balance (Optimism ETH) and a non-native non-base balance (Arbitrum USDC). Base ETH pays directly; other balances route through the zap flow.',
		render: () =>
			EnterChoosePaymentWalletPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 8,
				balances: mockPaymentWalletBalances,
			}),
	},
	checkout: {
		description:
			'Unified checkout for all payment paths. "direct-*" pays Base ETH straight into the game (no bridge header, no "Receive on" line). "crosschain-*" pays from Arbitrum and bridges to Base (bridge cost + time). "samechain-sufficient" pays a non-native token on Base (network fee only). Confirm when funds cover everything; otherwise per-currency "Not enough" blocks with Deposit buttons replace Confirm. Every variant offers Change payment wallet. The two crosschain-insufficient variants differ by which balance is short: "amount" (the source token) or "native" (gas for fees).',
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
			'Final step of the direct enter flow. Confirms a successful entry — shows rip number, entry count, entry total, fill status, and the transaction. Opened after enter-confirm.',
		render: () =>
			EnterSuccessPage.render({
				kind: 'direct',
				result: mockPurchase,
				rip: mockRip,
			}),
	},
	'zap-choose-chain': {
		description:
			'First step of the zap flow. Entered from enter-insufficient-funds when the user wants to pay from another chain. Shows available source chains.',
		render: () =>
			ZapChooseChainPage.render({
				availablePreset: mockAvailablePreset0,
			}),
	},
	'zap-choose-token': {
		description:
			'Second step of the zap flow. Choose a token on the selected chain to pay with.',
		render: () =>
			ZapChooseTokenPage.render({
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
	'zap-success': {
		description:
			'Final step of the crosschain zap flow. Confirms a successful entry — shows rip, entry count, entry total, fill status, and a transaction per chain.',
		render: () =>
			EnterSuccessPage.render({
				kind: 'crosschain',
				submit: mockZapSubmit,
				result: mockZapSuccessResult,
				rip: mockRip,
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
			'Individual rip detail — one page, five variants by RipStatusGroup. All variants share Status, Entry level, Your entries and Total entries. FILLING adds time left and an Enter Rip button. FINALIZING shows a "pulls being prepared" notice. FINALIZED adds your pulls, total credited and best pull, with View Pulls and Enter Again. REFUNDING shows the expected refund as in progress; REFUNDED shows the returned amount and offers Enter Again.',
		variants: [
			'filling',
			'finalizing',
			'finalized',
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
			'List of all active rips grouped by preset tier, showing entries remaining and time left per rip. Back leads to Status.',
		render: () =>
			OngoingRipsPage.render([mockRip, mockRip2], mockAvailablePresets),
	},
	'finished-rips': {
		description:
			'Global list of all completed rips, showing preset tier, rip number, and status. Back leads to Status.',
		render: () => FinishedRipsPage.render(mockFinishedRips),
	},
	'reveal-payouts': {
		description:
			'Entry point for revealing entries ("Open Rips" in the Play menu). Shows unrevealed entry count with "Reveal next" and "Reveal all" buttons. Part of a 3-page reveal flow that behaves as one screen to the user — back leads to Play.',
		render: () => RevealPayoutsPage.render(mockUnrevealedPayouts),
	},
	'reveal-single': {
		description:
			'Shows the result of revealing one entry. Also shows remaining unrevealed count with options to continue. Only opened from reveal-payouts. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealSinglePage.render(
				mockRip,
				mockRevealedPayout0,
				mockUnrevealedPayouts,
			),
	},
	'reveal-all': {
		description:
			'Shows all revealed payouts as a list. Also shows remaining unrevealed count. Can be opened from reveal-payouts or reveal-single. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealAllPage.render(
				[mockRip],
				mockRevealedPayouts,
				mockUnrevealedPayouts,
			),
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
			'Withdraw hub. Shows chain, token, balance, and optionally chosen amount and recipient. Buttons to choose amount and enter recipient.',
		render: () =>
			WithdrawPage.render(mockBalance, mockWithdrawAmount, undefined),
	},
	'withdraw-checkout': {
		description:
			'Withdraw checkout. USDC on Arbitrum. Confirm if sufficient, error guidance if not.',
		variants: ['sufficient', 'insufficient-token', 'insufficient-native'],
		render(variant) {
			const resolvedVariant = resolveVariant(this, variant)

			const currencyAmount =
				resolvedVariant === 'insufficient-token'
					? mockUsdcArbWithdrawAmountInsufficient
					: mockUsdcArbWithdrawAmount

			const nativeBalance =
				resolvedVariant === 'insufficient-native'
					? mockEthArbBalanceInsufficient
					: mockEthArbBalance

			return WithdrawCheckoutPage.render({
				currencyBalance: mockUsdcArbBalance,
				nativeBalance,
				currencyAmount,
				withdrawQuote: { blockchainFee: mockEthArbNetworkFee },
				recipientAddress: mockReceiverAddress,
				userEvmAddress: mockUserEvmAddress,
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
	'referral-about': {
		description:
			'Explains how the referral system works: fee share tiers based on 30-day volume, custom percent override. Back leads to referral-system.',
		render: () => ReferralAboutPage.render(mockTierTables),
	},
	'referral-withdraw-success': {
		description:
			'Confirms a successful reward withdrawal — shows amount and network fee. Back leads to referral-system.',
		render: () =>
			WithdrawRewardSuccessPage.render(mockWithdrawRewardResponse),
	},
	about: {
		description:
			'Explains how the game works and lists all available preset tiers. Each tier shows the entry price (with USD equivalent), rip duration, and entry cap.',
		render: () => AboutPage.render(mockConfigs),
	},
}
