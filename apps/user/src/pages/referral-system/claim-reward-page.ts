import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { currencyAmountDisplayParts, formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { claimBreadcrumb } from '../../utils/display/breadcrumb'

export interface ClaimRewardArgs {
	reward: CurrencyAmountDto
	nativeBalance: CurrencyAmountDto
	blockchainFee: CurrencyAmountDto
}

export const ClaimRewardPage = {
	render(args: ClaimRewardArgs): PageContent {
		const isFeeCovered = coversFee(args)

		return {
			message: buildMessage(args, isFeeCovered),
			keyboard: buildKeyboard(args, isFeeCovered),
		}
	},
}

function coversFee(args: ClaimRewardArgs): boolean {
	return (
		BigInt(args.nativeBalance.amount) >= BigInt(args.blockchainFee.amount)
	)
}

function buildMessage(
	args: ClaimRewardArgs,
	isFeeCovered: boolean,
): FormattedString {
	const { reward, nativeBalance, blockchainFee } = args

	const lines: Line[] = [
		claimBreadcrumb(),
		'',
		'You are about to claim:',
		formatAmountWithUsd(reward),
		'',
		`Blockchain fee: ${formatAmountWithUsd(blockchainFee)}`,
		'',
		`Your ${currencyLabel(nativeBalance.currency)} balance: ${formatAmount(nativeBalance)}`,
	]

	if (!isFeeCovered) {
		lines.push(
			'',
			fmt`⚠️ ${FormattedString.b(`Not enough ${currencyLabel(nativeBalance.currency)} to cover fee`)}`,
		)
	}

	return joinLines(lines)
}

function currencyLabel(currency: CurrencyDto): string {
	return `${currencyToChainName(currency)} ${currency.symbol}`
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildKeyboard(
	args: ClaimRewardArgs,
	isFeeCovered: boolean,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	if (isFeeCovered) {
		keyboard.text(
			'Claim',
			buildActionData(actionIds.executeReferralWithdrawReward, undefined),
		)
	} else {
		const { currency } = args.nativeBalance

		keyboard.text(
			`Deposit ${currencyLabel(currency)}`,
			buildActionData(
				actionIds.openDepositAddress,
				currency.chainAddress,
			),
		)
	}

	return keyboard.appendNavButtons({
		parent: actionIds.openReferral,
		home: actionIds.openHome,
	})
}
