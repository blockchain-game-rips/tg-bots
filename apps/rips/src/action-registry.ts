import { buyTickets } from './action-handlers/play/buy-tickets'
import { executeZap } from './action-handlers/play/execute-zap'
import { requestCustomTicketCount } from './action-handlers/play/request-custom-ticket-count'
import { showBuyCheckout } from './action-handlers/play/show-buy-checkout'
import { showBuyChooseStake } from './action-handlers/play/show-buy-choose-stake'
import { showBuyChooseTicketCount } from './action-handlers/play/show-buy-choose-ticket-count'
import { showCardChooseStake } from './action-handlers/play/show-card-choose-stake'
import { showCardCollection } from './action-handlers/play/show-card-collection'
import { showCompletedRounds } from './action-handlers/play/show-completed-rounds'
import { showOngoingRounds } from './action-handlers/play/show-ongoing-rounds'
import { showOpenRips } from './action-handlers/play/show-open-rips'
import { showPlay } from './action-handlers/play/show-play'
import { showRevealAll } from './action-handlers/play/show-reveal-all'
import { showRevealPrizes } from './action-handlers/play/show-reveal-prizes'
import { showRevealSingle } from './action-handlers/play/show-reveal-single'
import { showStatus } from './action-handlers/play/show-status'
import { showZapChooseChain } from './action-handlers/play/show-zap-choose-chain'
import { showZapChooseToken } from './action-handlers/play/show-zap-choose-token'
import { showZapConfirm } from './action-handlers/play/show-zap-confirm'
import { showReferral } from './action-handlers/referral-system/show-referral'
import { showReferralAbout } from './action-handlers/referral-system/show-referral-about'
import { showReferralWithdrawReward } from './action-handlers/referral-system/show-referral-withdraw-reward'
import { showAbout } from './action-handlers/show-about'
import { showHome } from './action-handlers/show-home'
import { askSwapAmount } from './action-handlers/wallet/ask-swap-amount'
import { askWithdrawCustomAmount } from './action-handlers/wallet/ask-withdraw-custom-amount'
import { askWithdrawRecipient } from './action-handlers/wallet/ask-withdraw-recipient'
import { executeSwap } from './action-handlers/wallet/execute-swap'
import { respondWithdrawChosenAmount } from './action-handlers/wallet/respond-withdraw-chosen-amount'
import { respondWithdrawChosenRecipient } from './action-handlers/wallet/respond-withdraw-chosen-recipient'
import { sendWithdrawTx } from './action-handlers/wallet/send-withdraw-tx'
import { showSwap } from './action-handlers/wallet/show-swap'
import { showSwapAmountChosen } from './action-handlers/wallet/show-swap-amount-chosen'
import { showSwapChooseAmount } from './action-handlers/wallet/show-swap-choose-amount'
import { showSwapChooseChain } from './action-handlers/wallet/show-swap-choose-chain'
import { showSwapChooseToken } from './action-handlers/wallet/show-swap-choose-token'
import { showSwapCurrencyChosen } from './action-handlers/wallet/show-swap-currency-chosen'
import { showWallet } from './action-handlers/wallet/show-wallet'
import { showWithdraw } from './action-handlers/wallet/show-withdraw'
import { showWithdrawChooseAmount } from './action-handlers/wallet/show-withdraw-choose-amount'
import { showWithdrawChooseChain } from './action-handlers/wallet/show-withdraw-choose-chain'
import { showWithdrawChooseCurrency } from './action-handlers/wallet/show-withdraw-choose-currency'
import { ActionHandler } from './types'

export const actionRegistry = {
	// Home
	showHome,

	// About
	showAbout,

	// Play
	showPlay,
	showChooseStake: showBuyChooseStake,
	showChooseTicketAmount: showBuyChooseTicketCount,
	requestCustomTicketAmount: requestCustomTicketCount,
	showBuyCheckout,
	buyTickets,

	// Open RIPs / rounds
	showOpenRips,
	showRevealPrizes,
	showRevealSingle,
	showRevealAll,
	showStatus,
	showOngoingRounds,
	showCompletedRounds,

	// Card collection
	showCardChooseStake,
	showCardCollection,

	// Wallet
	showWallet,

	// Withdraw
	showWithdrawChooseChain,
	showWithdrawChooseToken: showWithdrawChooseCurrency,
	showWithdraw,
	showWithdrawChooseAmount,
	sendWithdrawTx,
	askWithdrawRecipient,
	respondWithdrawRecipient: respondWithdrawChosenRecipient,
	respondWithdrawCustomAmount: respondWithdrawChosenAmount,
	askWithdrawAmount: askWithdrawCustomAmount,

	// Referral
	showReferral,
	showReferralAbout,
	showReferralWithdrawReward,

	// Zap
	showZapChooseChain,
	showZapChooseToken,
	showZapConfirm,
	executeZap,

	// Swap
	showSwap,
	showSwapChooseChain,
	showSwapChooseToken,
	showSwapChooseAmount,
	showSwapCurrencyChosen,
	showSwapAmountChosen,
	executeSwap,
	askSwapAmount,
} satisfies Record<string, ActionHandler>
