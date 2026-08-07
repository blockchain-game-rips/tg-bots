import { AnyActionDef } from '@rips/grammy-kit'
import { openAbout } from './action-handlers/open-about'
import {
	chooseCreateAccount,
	openHome,
	startImportKey,
	submitImportKey,
} from './action-handlers/open-home'
import { executeEnter } from './action-handlers/play/enter/execute-enter'
import {
	openEnterCheckout,
	openEnterCheckoutFromEntryCount,
	openEnterCheckoutFromPaymentToken,
} from './action-handlers/play/enter/open-enter-checkout'
import {
	openEnterChooseEntryCount,
	openEnterChooseEntryCountFromCheckout,
} from './action-handlers/play/enter/open-enter-choose-entry-count'
import {
	openEnterPaymentOptions,
	openEnterPaymentOptionsFromEntryCount,
} from './action-handlers/play/enter/open-enter-payment-options'
import { openEnterChoosePreset } from './action-handlers/play/enter/open-enter-choose-preset'
import { openCardCollection } from './action-handlers/play/open-card-collection'
import { openCardCollectionTier } from './action-handlers/play/open-card-collection-tier'
import { openFinalizedRips } from './action-handlers/play/open-finalized-rips'
import { openOngoingRips } from './action-handlers/play/open-ongoing-rips'
import {
	openOpenPulls,
	openOpenPullsNoBack,
} from './action-handlers/play/open-open-pulls'
import { openRevealAll } from './action-handlers/play/open-reveal-all'
import { openRevealPayouts } from './action-handlers/play/open-reveal-payouts'
import { openRevealSingle } from './action-handlers/play/open-reveal-single'
import { openRipStatus } from './action-handlers/play/open-rip-status'
import { openMyRips } from './action-handlers/play/open-my-rips'
import { openViewPulls } from './action-handlers/play/open-view-pulls'
import {
	openEnterChoosePaymentChain,
	openEnterChoosePaymentToken,
} from './action-handlers/play/enter/open-enter-choose-payment-chain-token'
import { promptEntryCount } from './action-handlers/play/enter/prompt-entry-count'
import { executeReferralWithdrawReward } from './action-handlers/referral-system/execute-referral-withdraw-reward'
import { openReferral } from './action-handlers/referral-system/open-referral'
import { openReferralTiers } from './action-handlers/referral-system/open-referral-tiers'
import { openReferralWithdrawReward } from './action-handlers/referral-system/open-referral-withdraw-reward'
import { executeWithdraw } from './action-handlers/wallet/execute-withdraw'
import { openDeposit } from './action-handlers/wallet/open-deposit'
import {
	openDepositAddress,
	openDepositAddressQr,
} from './action-handlers/wallet/open-deposit-address'
import { openDepositChooseCurrency } from './action-handlers/wallet/open-deposit-choose-currency'
import {
	openExportKey,
	openExportKeyWarning,
} from './action-handlers/wallet/open-export-key'
import { openWallet } from './action-handlers/wallet/open-wallet'
import {
	openWithdrawFromAmount,
	openWithdrawFromCurrency,
	openWithdrawFromRecipient,
} from './action-handlers/wallet/open-withdraw'
import { openWithdrawChooseAmount } from './action-handlers/wallet/open-withdraw-choose-amount'
import { openWithdrawChooseChain } from './action-handlers/wallet/open-withdraw-choose-chain'
import { openWithdrawChooseCurrency } from './action-handlers/wallet/open-withdraw-choose-currency'
import { promptWithdrawAmount } from './action-handlers/wallet/prompt-withdraw-amount'
import { promptWithdrawRecipient } from './action-handlers/wallet/prompt-withdraw-recipient'
import { executeSwap } from './action-handlers/wallet/swap/execute-swap'
import {
	openSwapCheckout,
	openSwapCheckoutFromAmount,
	openSwapCheckoutFromDst,
	openSwapCheckoutFromSrc,
} from './action-handlers/wallet/swap/open-swap-checkout'
import { openSwapChooseAmount } from './action-handlers/wallet/swap/open-swap-choose-amount'
import { openSwapChooseDstChain } from './action-handlers/wallet/swap/open-swap-choose-dst-chain'
import { openSwapChooseDstToken } from './action-handlers/wallet/swap/open-swap-choose-dst-token'
import { openSwapChooseSrcChain } from './action-handlers/wallet/swap/open-swap-choose-src-chain'
import { openSwapChooseSrcToken } from './action-handlers/wallet/swap/open-swap-choose-src-token'
import { promptSwapAmount } from './action-handlers/wallet/swap/prompt-swap-amount'

export const actionRegistry = {
	// Home
	// SHOULD BE AT THE START DUE TO CIRCULAR DEPS
	openHome,

	// Onboarding
	chooseCreateAccount,
	startImportKey,
	submitImportKey,

	// About
	openAbout,

	// Play
	openChoosePreset: openEnterChoosePreset,
	openChooseEntryAmount: openEnterChooseEntryCount,
	openEnterChooseEntryCountFromCheckout,
	openEnterPaymentOptions,
	openEnterPaymentOptionsFromEntryCount,
	promptEntryCount,
	openEnterCheckout,
	openEnterCheckoutFromPaymentToken,
	openEnterCheckoutFromEntryCount,
	executeEnter,

	// Open RIPs / rips
	openOpenPulls,
	openOpenPullsNoBack,
	openRevealPayouts,
	openRevealSingle,
	openRevealAll,
	openMyRips,
	openRipStatus,
	openViewPulls,
	openOngoingRips,
	openFinalizedRips,

	// Card collection
	openCardCollection,
	openCardCollectionTier,

	// Wallet
	openWallet,
	openDeposit,
	openDepositChooseCurrency,
	openDepositAddress,
	openDepositAddressQr,
	openExportKeyWarning,
	openExportKey,

	// Withdraw
	openWithdrawChooseChain,
	openWithdrawChooseCurrency,
	openWithdrawFromCurrency,
	openWithdrawFromAmount,
	openWithdrawFromRecipient,
	openWithdrawChooseAmount,
	executeWithdraw,
	promptWithdrawRecipient,
	promptWithdrawAmount,

	// Referral
	openReferral,
	openReferralTiers,
	openReferralWithdrawReward,
	executeReferralWithdrawReward,

	// Payment chain / token pickers
	openEnterChoosePaymentChain,
	openEnterChoosePaymentToken,

	// Swap
	openSwapChooseSrcChain,
	openSwapChooseSrcToken,
	openSwapChooseDstChain,
	openSwapChooseDstToken,
	openSwapChooseAmount,
	promptSwapAmount,
	openSwapCheckout,
	openSwapCheckoutFromSrc,
	openSwapCheckoutFromDst,
	openSwapCheckoutFromAmount,
	executeSwap,
} satisfies Record<string, AnyActionDef>
