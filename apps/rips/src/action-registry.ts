import { ActionDef } from './action-def'
import { openAbout } from './action-handlers/open-about'
import { openHome } from './action-handlers/open-home'
import { executeBuyTickets } from './action-handlers/play/execute-buy-tickets'
import { executeZap } from './action-handlers/play/execute-zap'
import { openBuyCheckout } from './action-handlers/play/open-buy-checkout'
import { openBuyChooseStake } from './action-handlers/play/open-buy-choose-stake'
import { openBuyChooseTicketCount } from './action-handlers/play/open-buy-choose-ticket-count'
import { openCardChooseStake } from './action-handlers/play/open-card-choose-stake'
import { openCardCollection } from './action-handlers/play/open-card-collection'
import { openCompletedRounds } from './action-handlers/play/open-completed-rounds'
import { openOngoingRounds } from './action-handlers/play/open-ongoing-rounds'
import {
	openOpenRips,
	openOpenRipsNoBack,
} from './action-handlers/play/open-open-rips'
import { openPlay } from './action-handlers/play/open-play'
import { openRevealAll } from './action-handlers/play/open-reveal-all'
import { openRevealPrizes } from './action-handlers/play/open-reveal-prizes'
import { openRevealSingle } from './action-handlers/play/open-reveal-single'
import { openStatus } from './action-handlers/play/open-status'
import { openZapChooseChain } from './action-handlers/play/open-zap-choose-chain'
import { openZapChooseToken } from './action-handlers/play/open-zap-choose-token'
import {
	openZapCheckout,
	refreshZapCheckout,
} from './action-handlers/play/open-zap-confirm'
import { promptTicketCount } from './action-handlers/play/prompt-ticket-count'
import { openReferral } from './action-handlers/referral-system/open-referral'
import { openReferralAbout } from './action-handlers/referral-system/open-referral-about'
import { openReferralWithdrawReward } from './action-handlers/referral-system/open-referral-withdraw-reward'
import { executeSwap } from './action-handlers/wallet/execute-swap'
import { executeWithdraw } from './action-handlers/wallet/execute-withdraw'
import { openAllBalances } from './action-handlers/wallet/open-all-balances'
import { openSwap } from './action-handlers/wallet/open-swap'
import { openSwapChooseAmount } from './action-handlers/wallet/open-swap-choose-amount'
import { openSwapChooseChain } from './action-handlers/wallet/open-swap-choose-chain'
import { openSwapChooseToken } from './action-handlers/wallet/open-swap-choose-token'
import { openWallet } from './action-handlers/wallet/open-wallet'
import { openWithdraw } from './action-handlers/wallet/open-withdraw'
import { openWithdrawChooseAmount } from './action-handlers/wallet/open-withdraw-choose-amount'
import { openWithdrawChooseChain } from './action-handlers/wallet/open-withdraw-choose-chain'
import { openWithdrawChooseCurrency } from './action-handlers/wallet/open-withdraw-choose-currency'
import { promptSwapAmount } from './action-handlers/wallet/prompt-swap-amount'
import { promptWithdrawAmount } from './action-handlers/wallet/prompt-withdraw-amount'
import { promptWithdrawRecipient } from './action-handlers/wallet/prompt-withdraw-recipient'
import { submitSwapAmount } from './action-handlers/wallet/submit-swap-amount'
import { submitSwapCurrency } from './action-handlers/wallet/submit-swap-currency'
import { submitWithdrawAmount } from './action-handlers/wallet/submit-withdraw-amount'
import { submitWithdrawRecipient } from './action-handlers/wallet/submit-withdraw-recipient'

export const actionRegistry = {
	// Home
	// SHOULD BE AT THE START DUE TO CIRCULAR DEPS
	openHome,

	// About
	openAbout,

	// Play
	openPlay,
	openChooseStake: openBuyChooseStake,
	openChooseTicketAmount: openBuyChooseTicketCount,
	promptTicketCount,
	openBuyCheckout,
	executeBuyTickets,

	// Open RIPs / rounds
	openOpenRips,
	openOpenRipsNoBack,
	openRevealPrizes,
	openRevealSingle,
	openRevealAll,
	openStatus,
	openOngoingRounds,
	openCompletedRounds,

	// Card collection
	openCardChooseStake,
	openCardCollection,

	// Wallet
	openWallet,
	openAllBalances,

	// Withdraw
	openWithdrawChooseChain,
	openWithdrawChooseToken: openWithdrawChooseCurrency,
	openWithdraw,
	openWithdrawChooseAmount,
	executeWithdraw,
	promptWithdrawRecipient,
	submitWithdrawRecipient,
	submitWithdrawAmount,
	promptWithdrawAmount,

	// Referral
	openReferral,
	openReferralAbout,
	openReferralWithdrawReward,

	// Zap
	openZapChooseChain,
	openZapChooseToken,
	openZapConfirm: openZapCheckout,
	refreshZapConfirm: refreshZapCheckout,
	executeZap,

	// Swap
	openSwap,
	openSwapChooseChain,
	openSwapChooseToken,
	openSwapChooseAmount,
	submitSwapCurrency,
	submitSwapAmount,
	executeSwap,
	promptSwapAmount,
} satisfies Record<string, ActionDef<any>>
