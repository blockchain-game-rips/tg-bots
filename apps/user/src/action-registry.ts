import { AnyActionDef } from '@rips/grammy-kit'
import { openAbout } from './action-handlers/open-about'
import { openHome } from './action-handlers/open-home'
import { executeBuyEntries } from './action-handlers/play/execute-buy-entries'
import { executeZap } from './action-handlers/play/execute-zap'
import { openBuyCheckout } from './action-handlers/play/open-buy-checkout'
import { openBuyChooseEntryCount } from './action-handlers/play/open-buy-choose-entry-count'
import { openBuyChoosePreset } from './action-handlers/play/open-buy-choose-preset'
import { openCardCollection } from './action-handlers/play/open-card-collection'
import { openCompletedRips } from './action-handlers/play/open-completed-rips'
import { openOngoingRips } from './action-handlers/play/open-ongoing-rips'
import {
	openOpenPulls,
	openOpenPullsNoBack,
} from './action-handlers/play/open-open-pulls'
import { openRevealAll } from './action-handlers/play/open-reveal-all'
import { openRevealPayouts } from './action-handlers/play/open-reveal-payouts'
import { openRevealSingle } from './action-handlers/play/open-reveal-single'
import { openStatus } from './action-handlers/play/open-status'
import { openZapChooseChain } from './action-handlers/play/open-zap-choose-chain'
import { openZapChooseToken } from './action-handlers/play/open-zap-choose-token'
import {
	openZapCheckout,
	refreshZapCheckout,
} from './action-handlers/play/open-zap-confirm'
import { promptEntryCount } from './action-handlers/play/prompt-entry-count'
import { openReferral } from './action-handlers/referral-system/open-referral'
import { openReferralAbout } from './action-handlers/referral-system/open-referral-about'
import { openReferralWithdrawReward } from './action-handlers/referral-system/open-referral-withdraw-reward'
import { executeWithdraw } from './action-handlers/wallet/execute-withdraw'
import { openAllBalances } from './action-handlers/wallet/open-all-balances'
import { openSwap } from './action-handlers/wallet/open-swap'
import { openSwapCheckout } from './action-handlers/wallet/open-swap-checkout'
import { openSwapChooseDstChain } from './action-handlers/wallet/open-swap-choose-dst-chain'
import { openSwapChooseSrcToken } from './action-handlers/wallet/open-swap-choose-src-token'
import { openWallet } from './action-handlers/wallet/open-wallet'
import { openWithdraw } from './action-handlers/wallet/open-withdraw'
import { openWithdrawChooseAmount } from './action-handlers/wallet/open-withdraw-choose-amount'
import { openWithdrawChooseChain } from './action-handlers/wallet/open-withdraw-choose-chain'
import { openWithdrawChooseCurrency } from './action-handlers/wallet/open-withdraw-choose-currency'
import { promptWithdrawAmount } from './action-handlers/wallet/prompt-withdraw-amount'
import { promptWithdrawRecipient } from './action-handlers/wallet/prompt-withdraw-recipient'
import { refreshWithdrawCheckout } from './action-handlers/wallet/refresh-withdraw-checkout'
import { submitWithdrawAmount } from './action-handlers/wallet/submit-withdraw-amount'
import { submitWithdrawRecipient } from './action-handlers/wallet/submit-withdraw-recipient'

export const actionRegistry = {
	// Home
	// SHOULD BE AT THE START DUE TO CIRCULAR DEPS
	openHome,

	// About
	openAbout,

	// Play
	openChoosePreset: openBuyChoosePreset,
	openChooseEntryAmount: openBuyChooseEntryCount,
	promptEntryCount,
	openBuyCheckout,
	executeBuyEntries,

	// Open RIPs / rips
	openOpenPulls,
	openOpenPullsNoBack,
	openRevealPayouts,
	openRevealSingle,
	openRevealAll,
	openStatus,
	openOngoingRips,
	openCompletedRips,

	// Card collection
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
	refreshWithdrawCheckout,

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
	openSwapChooseSrcToken,
	openSwapChooseDstChain,
	openSwapCheckout,
} satisfies Record<string, AnyActionDef>
