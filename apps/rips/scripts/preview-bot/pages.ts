import { AboutPage } from '../../src/pages/about/about-page'
import { HomePage } from '../../src/pages/home-page'
import { BuyCheckoutPage } from '../../src/pages/play/buy-checkout-page'
import { BuyChooseStakePage } from '../../src/pages/play/buy-choose-stake-page'
import { BuyChooseTicketCountPage } from '../../src/pages/play/buy-choose-ticket-count-page'
import { BuySuccessPage } from '../../src/pages/play/buy-success-page'
import { CardCollectionPage } from '../../src/pages/play/card-collection'
import { CardCollectionChooseStakePage } from '../../src/pages/play/card-collection-choose-stake'
import { FinishedRoundsPage } from '../../src/pages/play/finished-rounds-page'
import { OngoingRoundsPage } from '../../src/pages/play/ongoing-rounds-page'
import { PlayPage } from '../../src/pages/play/play-page'
import { RevealAllPage } from '../../src/pages/play/reveal-all-page'
import { RevealPrizesPage } from '../../src/pages/play/reveal-prizes-page'
import { RevealSinglePage } from '../../src/pages/play/reveal-single-page'
import { StatusPage } from '../../src/pages/play/status-page'
import { ZapChooseChainPage } from '../../src/pages/play/zap-choose-chain-page'
import { ZapChooseTokenPage } from '../../src/pages/play/zap-choose-token-page'
import { ZapConfirmPage } from '../../src/pages/play/zap-confirm-page'
import { ZapInsufficientFundsPage } from '../../src/pages/play/zap-insufficient-funds-page'
import { ZapSuccessPage } from '../../src/pages/play/zap-success-page'
import { ReferralAboutPage } from '../../src/pages/referral-system/referral-about-page'
import { ReferralSystemPage } from '../../src/pages/referral-system/referral-system'
import { WithdrawRewardSuccessPage } from '../../src/pages/referral-system/withdraw-reward-success-page'
import { SwapChooseAmountPage } from '../../src/pages/wallet/swap-choose-amount'
import { SwapChooseChainPage } from '../../src/pages/wallet/swap-choose-chain'
import { SwapChooseTokenPage } from '../../src/pages/wallet/swap-choose-token'
import { SwapConfirmPage } from '../../src/pages/wallet/swap-confirm'
import { SwapInsufficientFundsPage } from '../../src/pages/wallet/swap-insufficient'
import { SwapPage } from '../../src/pages/wallet/swap-page'
import { WalletPage } from '../../src/pages/wallet/wallet-page'
import { WithdrawChooseAmountPage } from '../../src/pages/wallet/withdraw-choose-amount-page'
import { WithdrawChooseChainPage } from '../../src/pages/wallet/withdraw-choose-chain-page'
import { WithdrawChooseReceiverPage } from '../../src/pages/wallet/withdraw-choose-receiver-page'
import { WithdrawChooseTokenPage } from '../../src/pages/wallet/withdraw-choose-token-page'
import { WithdrawConfirmPage } from '../../src/pages/wallet/withdraw-confirm-page'
import { WithdrawInsufficientFundsPage } from '../../src/pages/wallet/withdraw-insufficient-funds-page'
import { WithdrawSuccessPage } from '../../src/pages/wallet/withdraw-success-page'
import { PageContent } from '../../src/types'
import {
	mockAvailableStakes,
	mockBalance,
	mockCardCollection,
	mockConfigs,
	mockFinishedRounds,
	mockPurchase,
	mockPurchaseQuote,
	mockReceiverAddress,
	mockReferrerData,
	mockRevealedPrizes,
	mockRound,
	mockRound2,
	mockSufficientBalance,
	mockSwapAmountIn,
	mockSwapNetworkFee,
	mockSwapQuote,
	mockSwapTokenInIndex,
	mockSwapTokenOutIndex,
	mockTicketCost,
	mockTierTables,
	mockUnrevealedPrizes,
	mockUserEvmAddress,
	mockWithdrawAmount,
	mockWithdrawChainIndex,
	mockWithdrawCurrencyIndex,
	mockWithdrawNetworkFee,
	mockWithdrawRewardResponse,
	mockWithdrawTransaction,
	mockZapCurrencyInBalance,
	mockZapQuote,
	mockZapSuccessResult,
} from './static-data'

export type PageEntry = {
	description: string
	variants?: string[]
	render: (variant?: string) => PageContent
}

export class VariantError extends Error {
	constructor(
		readonly received: string | undefined,
		readonly available: string[],
	) {
		super()
	}
}

export function resolveVariant(
	entry: PageEntry,
	variant: string | undefined,
): string {
	if (!entry.variants?.length) return variant ?? ''

	const match = entry.variants.find((v) => v === variant)

	if (!match) throw new VariantError(variant, entry.variants)

	return match
}

export const pages: Record<string, PageEntry> = {
	home: {
		description:
			'Main entry point of the bot. Shows navigation to Play, Wallet, About, and Referral System.',
		render: () => HomePage.render(),
	},
	play: {
		description:
			'The Play hub. Shows the main game actions: buy tickets, open (reveal) rips, check round status, and access the card collection.',
		render: () => PlayPage.render(),
	},
	'card-collection-choose-stake': {
		description:
			'Entry to the card collection, opened from Play. Choose a stake tier to view the card collection for.',
		render: () => CardCollectionChooseStakePage.render(mockAvailableStakes),
	},
	'card-collection': {
		description:
			'Shows the full card collection for the selected stake tier — each card with name (linked to image) and how many the user owns.',
		render: () => CardCollectionPage.render(mockCardCollection),
	},
	'buy-choose-stake': {
		description:
			'First step of buying tickets. Shows available stake tiers to pick from. Opened from Play.',
		render: () => BuyChooseStakePage.render(mockAvailableStakes),
	},
	'buy-choose-ticket-count': {
		description:
			'Second step of buying tickets. Choose how many tickets to buy: preset options or custom amount. Opened from choose-stake.',
		render: () => BuyChooseTicketCountPage.render(mockAvailableStakes[0]),
	},
	'buy-checkout': {
		description:
			'Third step of buying tickets. Shows costs and balance breakdown. Confirm button if funds are sufficient, zap option if not.',
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
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
				currencyInAmount: mockTicketCost,
				purchaseQuote: mockPurchaseQuote,
				nativeBalance: balance,
				currencyInBalance: balance,
				userEvmAddress: mockUserEvmAddress,
			})
		},
	},
	'buy-success': {
		description:
			'Final step of the buy flow. Confirms a successful ticket purchase — shows round number, ticket count, total cost, and blockchain fee. Opened after buy-confirm.',
		render: () => BuySuccessPage.render(mockPurchase, mockRound),
	},
	'zap-choose-chain': {
		description:
			'First step of the zap flow. Entered from buy-insufficient-funds when the user wants to pay from another chain. Shows available source chains.',
		render: () =>
			ZapChooseChainPage.render({
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
			}),
	},
	'zap-choose-token': {
		description:
			'Second step of the zap flow. Choose a token on the selected chain to pay with.',
		render: () =>
			ZapChooseTokenPage.render({
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
				chainIndex: 0,
			}),
	},
	'zap-confirm': {
		description:
			'Third step of the zap flow. Shows zap quote: amount to pay, token balance, and network fee. Confirm to proceed.',
		render: () =>
			ZapConfirmPage.render({
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
				nativeBalance: mockBalance,
				currencyInBalance: mockZapCurrencyInBalance,
				zapQuote: mockZapQuote,
			}),
	},
	'zap-insufficient-funds': {
		description:
			'Shown instead of zap-confirm when token balance is too low. Shows required vs available amount. User can top up and retry.',
		render: () =>
			ZapInsufficientFundsPage.render({
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
				nativeBalance: mockBalance,
				currencyInBalance: mockZapCurrencyInBalance,
				zapQuote: mockZapQuote,
				userEvmAddress: mockUserEvmAddress,
			}),
	},
	'zap-success': {
		description:
			'Final step of the zap flow. Confirms zap + ticket purchase succeeded — shows stake, round, ticket count, amount paid, and blockchain fee.',
		render: () =>
			ZapSuccessPage.render({
				availableStake: mockAvailableStakes[0],
				ticketCount: 3,
				amountIn: mockZapCurrencyInBalance,
				zapSuccessResult: mockZapSuccessResult,
			}),
	},
	status: {
		description:
			"Overview of the user's activity — shows their tickets in ongoing rounds, with navigation to Ongoing Rounds and Completed Rounds lists.",
		render: () => StatusPage.render([mockRound], mockUserEvmAddress),
	},
	'ongoing-rounds': {
		description:
			'List of all active rounds grouped by stake tier, showing tickets remaining and time left per round. Back leads to Status.',
		render: () =>
			OngoingRoundsPage.render(
				[mockRound, mockRound2],
				mockAvailableStakes,
			),
	},
	'finished-rounds': {
		description:
			'Global list of all completed rounds, showing stake tier, round number, and status. Back leads to Status.',
		render: () => FinishedRoundsPage.render(mockFinishedRounds),
	},
	'reveal-prizes': {
		description:
			'Entry point for revealing tickets ("Open Rips" in the Play menu). Shows unrevealed ticket count with "Reveal next" and "Reveal all" buttons. Part of a 3-page reveal flow that behaves as one screen to the user — back leads to Play.',
		render: () => RevealPrizesPage.render(mockUnrevealedPrizes),
	},
	'reveal-single': {
		description:
			'Shows the result of revealing one ticket. Also shows remaining unrevealed count with options to continue. Only opened from reveal-prizes. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealSinglePage.render(
				mockRound,
				mockRevealedPrizes[0],
				mockUnrevealedPrizes,
			),
	},
	'reveal-all': {
		description:
			'Shows all revealed prizes as a list. Also shows remaining unrevealed count. Can be opened from reveal-prizes or reveal-single. Part of the reveal flow — back leads to Play.',
		render: () =>
			RevealAllPage.render(
				[mockRound],
				mockRevealedPrizes,
				mockUnrevealedPrizes,
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
		render: () =>
			WithdrawChooseTokenPage.render({
				chainIndex: mockWithdrawChainIndex,
			}),
	},
	'withdraw-choose-amount': {
		description:
			'Third step of the withdraw flow. Choose amount — max or custom.',
		render: () =>
			WithdrawChooseAmountPage.render({
				chainIndex: mockWithdrawChainIndex,
				currencyIndex: mockWithdrawCurrencyIndex,
				balance: mockBalance,
			}),
	},
	'withdraw-choose-receiver': {
		description:
			'Fourth step of the withdraw flow. Enter the recipient address.',
		render: () =>
			WithdrawChooseReceiverPage.render({
				chainIndex: mockWithdrawChainIndex,
				currencyIndex: mockWithdrawCurrencyIndex,
				amount: '0.005',
			}),
	},
	'withdraw-confirm': {
		description:
			'Fifth step of the withdraw flow. Summary: chain, token, amount, recipient, network fee. Confirm to proceed.',
		render: () =>
			WithdrawConfirmPage.render({
				chainIndex: mockWithdrawChainIndex,
				currencyIndex: mockWithdrawCurrencyIndex,
				amount: mockWithdrawAmount,
				networkFee: mockWithdrawNetworkFee,
				receiverAddress: mockReceiverAddress,
			}),
	},
	'withdraw-success': {
		description:
			'Confirms a successful withdrawal — shows transaction ID. Opened after withdraw-confirm.',
		render: () => WithdrawSuccessPage.render(mockWithdrawTransaction),
	},
	'withdraw-insufficient-funds': {
		description:
			'Shown when balance is too low to withdraw. Shows required vs available and user address to top up. Has a "Choose amount" button to go back and pick a different amount.',
		render: () =>
			WithdrawInsufficientFundsPage.render({
				chainIndex: mockWithdrawChainIndex,
				currencyIndex: mockWithdrawCurrencyIndex,
				amount: mockWithdrawAmount,
				balance: mockBalance,
				userEvmAddress: mockUserEvmAddress,
			}),
	},
	swap: {
		description:
			'Swap hub. Select token in and token out, then proceed to choose amount. Opened from Wallet.',
		render: () =>
			SwapPage.render({
				in: { tokenIndex: mockSwapTokenInIndex, chainIndex: 0 },
				out: { tokenIndex: mockSwapTokenOutIndex, chainIndex: 1 },
			}),
	},
	'swap-choose-chain': {
		description:
			'Choose a chain when selecting a token for the swap. Opened from swap.',
		render: () => SwapChooseChainPage.render(),
	},
	'swap-choose-token': {
		description:
			'Choose a token on the selected chain. Opened from swap-choose-chain.',
		render: () => SwapChooseTokenPage.render({ chainIndex: 0 }),
	},
	'swap-choose-amount': {
		description:
			'Choose how much to swap — max or custom amount. Opened from swap after both tokens are selected.',
		render: () =>
			SwapChooseAmountPage.render({
				tokenInIndex: mockSwapTokenInIndex,
				tokenOutIndex: mockSwapTokenOutIndex,
				chainInIndex: 0,
				chainOutIndex: 1,
				balance: mockBalance,
			}),
	},
	'swap-confirm': {
		description:
			'Shows swap quote: amount in, amount out, swap fee, network fee. Confirm to proceed. Opened from swap-choose-amount.',
		render: () =>
			SwapConfirmPage.render({
				tokenInIndex: mockSwapTokenInIndex,
				tokenOutIndex: mockSwapTokenOutIndex,
				amountIn: mockSwapAmountIn,
				networkFee: mockSwapNetworkFee,
				swapQuote: mockSwapQuote,
			}),
	},
	'swap-insufficient-funds': {
		description:
			'Shown when token balance is too low for the swap. Shows required vs available. User can go back and choose a different amount.',
		render: () =>
			SwapInsufficientFundsPage.render({
				tokenInIndex: mockSwapTokenInIndex,
				tokenOutIndex: mockSwapTokenOutIndex,
				amountIn: mockSwapAmountIn,
				balance: mockBalance,
				swapQuote: mockSwapQuote,
				userEvmAddress: mockUserEvmAddress,
			}),
	},
	wallet: {
		description:
			"Wallet hub. Shows the user's ETH balance and deposit address, with navigation to Withdraw and Swap. Opened from Home.",
		render: () => WalletPage.render(mockBalance, mockUserEvmAddress),
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
			'Explains how the game works and lists all available stake tiers. Each tier shows the ticket price (with USD equivalent), round duration, and ticket cap.',
		render: () => AboutPage.render(mockConfigs),
	},
}
