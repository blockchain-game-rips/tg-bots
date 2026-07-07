import { PageEntry, resolveVariant, VariantError } from '@rips/grammy-kit'
import { AboutPage } from '../../src/pages/about/about-page'
import { HomePage } from '../../src/pages/home-page'
import { BuyCheckoutPage } from '../../src/pages/play/buy-checkout-page'
import { BuyChooseEntryCountPage } from '../../src/pages/play/buy-choose-entry-count-page'
import { BuyChoosePresetPage } from '../../src/pages/play/buy-choose-preset-page'
import { BuySuccessPage } from '../../src/pages/play/buy-success-page'
import { CardCollectionPage } from '../../src/pages/play/card-collection'
import { FinishedRipsPage } from '../../src/pages/play/finished-rips-page'
import { OngoingRipsPage } from '../../src/pages/play/ongoing-rips-page'
import { PlayPage } from '../../src/pages/play/play-page'
import { RevealAllPage } from '../../src/pages/play/reveal-all-page'
import { RevealPayoutsPage } from '../../src/pages/play/reveal-payouts-page'
import { RevealSinglePage } from '../../src/pages/play/reveal-single-page'
import { StatusPage } from '../../src/pages/play/status-page'
import { ZapCheckoutPage } from '../../src/pages/play/zap-checkout-page'
import { ZapChooseChainPage } from '../../src/pages/play/zap-choose-chain-page'
import { ZapChooseTokenPage } from '../../src/pages/play/zap-choose-token-page'
import { ZapFailedPage } from '../../src/pages/play/zap-failed-page'
import { ZapSuccessPage } from '../../src/pages/play/zap-success-page'
import { ReferralAboutPage } from '../../src/pages/referral-system/referral-about-page'
import { ReferralSystemPage } from '../../src/pages/referral-system/referral-system'
import { WithdrawRewardSuccessPage } from '../../src/pages/referral-system/withdraw-reward-success-page'
import { AllBalancesPage } from '../../src/pages/wallet/all-balances-page'
import { SwapCheckoutPage } from '../../src/pages/wallet/swap-checkout'
import { SwapChooseAmountPage } from '../../src/pages/wallet/swap-choose-amount'
import { SwapChooseChainPage } from '../../src/pages/wallet/swap-choose-chain'
import { SwapChooseTokenPage } from '../../src/pages/wallet/swap-choose-token'
import { SwapPage } from '../../src/pages/wallet/swap-page'
import { WalletPage } from '../../src/pages/wallet/wallet-page'
import { WithdrawCheckoutPage } from '../../src/pages/wallet/withdraw-checkout-page'
import { WithdrawChooseAmountPage } from '../../src/pages/wallet/withdraw-choose-amount-page'
import { WithdrawChooseChainPage } from '../../src/pages/wallet/withdraw-choose-chain-page'
import { WithdrawChooseCurrencyPage } from '../../src/pages/wallet/withdraw-choose-currency-page'
import { WithdrawPage } from '../../src/pages/wallet/withdraw-page'
import { WithdrawSuccessPage } from '../../src/pages/wallet/withdraw-success-page'
import {
	mockAllBalances,
	mockAvailablePresets,
	mockBalance,
	mockCardCollection,
	mockConfigs,
	mockEntryCost,
	mockEthArbBalance,
	mockEthArbBalanceInsufficient,
	mockEthArbNetworkFee,
	mockFinishedRips,
	mockPurchase,
	mockPurchaseQuote,
	mockReceiverAddress,
	mockReferrerData,
	mockRevealedPayouts,
	mockRip,
	mockRip2,
	mockSufficientBalance,
	mockSwapAmountIn,
	mockSwapNetworkFee,
	mockSwapQuote,
	mockTierTables,
	mockUnrevealedPayouts,
	mockUsdcArbBalance,
	mockUsdcArbWithdrawAmount,
	mockUsdcArbWithdrawAmountInsufficient,
	mockUserEvmAddress,
	mockWithdrawAmount,
	mockWithdrawRewardResponse,
	mockWithdrawTransaction,
	mockZapCurrencyInBalance,
	mockZapQuote,
	mockZapSuccessResult,
	mockZeroBalance,
} from './static-data'

const REFERRAL_FEE_BPS = 1000
const PULLS_COUNT = 8

const mockWithdrawCurrencies = [mockWithdrawAmount.currency]
const mockSwapCurrencies = [mockSwapAmountIn.currency]

const mockAvailablePreset0 = mockAvailablePresets[0]
const mockRevealedPayout0 = mockRevealedPayouts[0]

if (mockAvailablePreset0 === undefined)
	throw new Error('mockAvailablePresets[0] is missing')
if (mockRevealedPayout0 === undefined)
	throw new Error('mockRevealedPayouts[0] is missing')

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
	play: {
		description:
			'The Play hub. Shows the main game actions: buy entries, open (reveal) rips, check rip status, and access the card collection.',
		render: () => PlayPage.render(),
	},
	'card-collection': {
		description:
			'Shows the full card collection — each card with name (linked to image) and how many the user owns.',
		render: () => CardCollectionPage.render(mockCardCollection),
	},
	'buy-choose-preset': {
		description:
			'First step of buying entries. Shows available preset tiers to pick from. Opened from Play.',
		render: () => BuyChoosePresetPage.render(mockAvailablePresets),
	},
	'buy-choose-entry-count': {
		description:
			'Second step of buying entries. Choose how many entries to buy: preset options or custom amount. Opened from choose-preset.',
		render: () => BuyChooseEntryCountPage.render(mockAvailablePreset0),
	},
	'buy-checkout': {
		description:
			'Third step of buying entries. Shows costs and balance breakdown. Confirm button if funds are sufficient, zap option if not.',
		variants: ['insufficient', 'sufficient'],
		render(variant) {
			const balance = (() => {
				switch (resolveVariant(this, variant)) {
					case 'insufficient':
						return mockBalance
					case 'sufficient':
						return mockSufficientBalance
					default:
						throw new VariantError(variant, this.variants ?? [])
				}
			})()

			return BuyCheckoutPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				currencyInAmount: mockEntryCost,
				purchaseQuote: mockPurchaseQuote,
				nativeBalance: balance,
				currencyInBalance: balance,
				userEvmAddress: mockUserEvmAddress,
			})
		},
	},
	'buy-success': {
		description:
			'Final step of the buy flow. Confirms a successful entry purchase — shows rip number, entry count, total cost, and blockchain fee. Opened after buy-confirm.',
		render: () => BuySuccessPage.render(mockPurchase, mockRip),
	},
	'zap-choose-chain': {
		description:
			'First step of the zap flow. Entered from buy-insufficient-funds when the user wants to pay from another chain. Shows available source chains.',
		render: () =>
			ZapChooseChainPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
			}),
	},
	'zap-choose-token': {
		description:
			'Second step of the zap flow. Choose a token on the selected chain to pay with.',
		render: () =>
			ZapChooseTokenPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				currencies: [mockZapCurrencyInBalance.currency],
			}),
	},
	'zap-checkout': {
		description:
			'Third step of the zap flow. Shows zap quote: amount to pay, token balance, and network fee. Confirm to proceed.',
		render: () =>
			ZapCheckoutPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				nativeBalance: mockBalance,
				currencyInBalance: mockZapCurrencyInBalance,
				zapQuote: mockZapQuote,
				userEvmAddress: mockUserEvmAddress,
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
			'Final step of the zap flow. Confirms zap + entry purchase succeeded — shows preset, rip, entry count, amount paid, and blockchain fee.',
		render: () =>
			ZapSuccessPage.render({
				availablePreset: mockAvailablePreset0,
				entryCount: 3,
				amountIn: mockZapCurrencyInBalance,
				zapSuccessResult: mockZapSuccessResult,
			}),
	},
	status: {
		description:
			"Overview of the user's activity — shows their entries in ongoing rips, with navigation to Ongoing Rips and Completed Rips lists.",
		render: () => StatusPage.render([mockRip], mockUserEvmAddress),
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
	'withdraw-choose-token': {
		description:
			'Second step of the withdraw flow. Choose a token on the selected chain.',
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
	swap: {
		description:
			'Swap hub. Select token in and token out, then proceed to choose amount. Opened from Wallet.',
		render: () =>
			SwapPage.render({
				currencyInBalance: mockSwapAmountIn,
				currencyOutBalance: mockSwapQuote.amountOut,
			}),
	},
	'swap-choose-chain': {
		description:
			'Choose a chain when selecting a token for the swap. Opened from swap.',
		render: () => SwapChooseChainPage.render('in'),
	},
	'swap-choose-token': {
		description:
			'Choose a token on the selected chain. Opened from swap-choose-chain.',
		render: () => SwapChooseTokenPage.render(mockSwapCurrencies, 'in'),
	},
	'swap-choose-amount': {
		description:
			'Choose how much to swap — max or custom amount. Opened from swap after both tokens are selected.',
		render: () =>
			SwapChooseAmountPage.render({
				currencyInBalance: mockSwapAmountIn,
				currencyOutBalance: mockSwapQuote.amountOut,
			}),
	},
	'swap-confirm': {
		description:
			'Shows swap quote: amount in, amount out, swap fee, network fee. Confirm to proceed. Opened from swap-choose-amount.',
		render: () =>
			SwapCheckoutPage.render({
				currencyInBalance: mockSwapAmountIn,
				nativeInBalance: mockSwapNetworkFee,
				amountIn: mockSwapAmountIn,
				currencyOutBalance: mockSwapQuote.amountOut,
				swapQuote: mockSwapQuote,
				userEvmAddress: mockUserEvmAddress,
			}),
	},
	wallet: {
		description:
			"Wallet hub. Shows the user's ETH balance and deposit address, with navigation to Withdraw and Swap. Opened from Home.",
		render: () => WalletPage.render(mockBalance, mockUserEvmAddress),
	},
	'all-balances': {
		description:
			'Shows all token balances grouped by chain. Opened from Wallet.',
		render: () => AllBalancesPage.render(mockAllBalances),
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
