import {
	CurrencyAmountDto,
	CurrencyDto,
	QuoteWithdrawResponseDtoOutput,
} from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	formatAmountWithUsd,
	fundsBreakdown,
	toCurrencyAmount,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import {
	chainToName,
	currencyToChain,
	currencyToChainName,
} from '../../utils/chain'
import { withdrawBreadcrumb } from '../../utils/display/breadcrumb'

const NOT_SET = 'Not set'

interface PendingArgs {
	kind: 'pending'
	currencyBalance: CurrencyAmountDto
	amount?: bigint
	recipientAddress?: string
}

interface QuotedArgs {
	kind: 'quoted'
	currencyBalance: CurrencyAmountDto
	nativeBalance: CurrencyAmountDto
	amount: bigint
	recipientAddress: string
	withdrawQuote: QuoteWithdrawResponseDtoOutput
}

export type WithdrawArgs = PendingArgs | QuotedArgs

type ResolvedArgs =
	| (Omit<PendingArgs, 'amount'> & { currencyAmount?: CurrencyAmountDto })
	| (Omit<QuotedArgs, 'amount'> & { currencyAmount: CurrencyAmountDto })

export const WithdrawPage = {
	render(args: WithdrawArgs): PageContent {
		const resolved = resolveAmount(args)

		const insufficientAmounts = findInsufficientBalances(resolved)

		return {
			message: buildMessage(resolved, insufficientAmounts),
			keyboard: buildKeyboard(resolved, insufficientAmounts),
		}
	},
}

function resolveAmount(args: WithdrawArgs): ResolvedArgs {
	const { currency } = args.currencyBalance

	if (args.kind === 'quoted') {
		return {
			...args,
			currencyAmount: toCurrencyAmount(args.amount, currency),
		}
	}

	const currencyAmount =
		args.amount !== undefined
			? toCurrencyAmount(args.amount, currency)
			: undefined

	return { ...args, currencyAmount }
}

function isEmptyBalance(args: ResolvedArgs): boolean {
	return args.kind === 'pending' && BigInt(args.currencyBalance.amount) === 0n
}

function findInsufficientBalances(args: ResolvedArgs): CurrencyAmountDto[] {
	if (args.kind === 'pending') return []

	const { currencyBalance, nativeBalance, currencyAmount, withdrawQuote } =
		args

	const { insufficientAmounts } = fundsBreakdown(
		[
			{ label: 'Amount', amount: currencyAmount },
			{ label: 'Blockchain fee', amount: withdrawQuote.blockchainFee },
		],
		[currencyBalance, nativeBalance],
	)

	return insufficientAmounts
}

function isSufficientAmounts(insufficientAmounts: CurrencyAmountDto[]) {
	return insufficientAmounts.length === 0
}

function buildMessage(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): FormattedString {
	const { currencyBalance, currencyAmount, recipientAddress } = args

	const { currency } = currencyBalance
	const chain = currencyToChain(currency)

	const amount =
		currencyAmount !== undefined
			? formatAmountWithUsd(currencyAmount)
			: NOT_SET

	const lines: Line[] = [
		withdrawBreadcrumb(chainToName(chain), currency.symbol),
		'',
	]

	if (!isEmptyBalance(args)) {
		lines.push(
			`Amount: ${amount}`,
			'',
			...recipientLines(recipientAddress),
			'',
		)
	}

	if (args.kind === 'quoted') {
		lines.push(
			`Blockchain fee: ${formatAmountWithUsd(args.withdrawQuote.blockchainFee)}`,
		)
	}

	lines.push(`Balance: ${formatAmountWithUsd(currencyBalance)}`)

	lines.push(...tailLines(args, insufficientAmounts))

	return joinLines(lines)
}

function recipientLines(recipientAddress: string | undefined): Line[] {
	if (recipientAddress === undefined) return [`Recipient: ${NOT_SET}`]

	return ['Recipient:', FormattedString.code(recipientAddress)]
}

function tailLines(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): Line[] {
	if (isEmptyBalance(args)) {
		const { currency } = args.currencyBalance

		return [
			'',
			fmt`⚠️ You do not have ${currency.symbol} available on ${currencyToChainName(currency)}.`,
		]
	}

	if (args.kind === 'pending') return []

	if (isSufficientAmounts(insufficientAmounts)) {
		return ['', 'Confirm to proceed']
	}

	return insufficientLines(args, insufficientAmounts)
}

function insufficientLines(
	args: Extract<ResolvedArgs, { kind: 'quoted' }>,
	insufficientAmounts: CurrencyAmountDto[],
): Line[] {
	const { currencyAmount, nativeBalance } = args

	if (isAmountInsufficient(currencyAmount, insufficientAmounts)) {
		return [
			'',
			fmt`⚠️ ${FormattedString.b(`Not enough ${currencyLabel(currencyAmount.currency)}`)}`,
			'',
			'Enter a smaller amount.',
		]
	}

	return [
		'',
		fmt`⚠️ ${FormattedString.b(`Not enough ${currencyLabel(nativeBalance.currency)} to cover fee`)}`,
		'',
		`Your ${currencyLabel(nativeBalance.currency)} balance: ${formatAmount(nativeBalance)}`,
	]
}

function isAmountInsufficient(
	currencyAmount: CurrencyAmountDto,
	insufficientAmounts: CurrencyAmountDto[],
): boolean {
	return insufficientAmounts.some(
		(balance) => balance.currency.id === currencyAmount.currency.id,
	)
}

function currencyLabel(currency: CurrencyDto): string {
	return `${currencyToChainName(currency)} ${currency.symbol}`
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildKeyboard(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): InlineKeyboard {
	const { currencyBalance } = args
	const chain = currencyToChain(currencyBalance.currency)

	const keyboard = new InlineKeyboard()

	const navButtons = {
		home: actionIds.openHome,
		parent: actionIds.openWithdrawChooseCurrency,
		parentPayload: chain,
	}

	if (isEmptyBalance(args)) {
		return keyboard.appendNavButtons(navButtons)
	}

	if (args.kind === 'quoted' && isSufficientAmounts(insufficientAmounts)) {
		keyboard
			.text(
				'Confirm',
				buildActionData(actionIds.executeWithdraw, undefined),
			)
			.row()
	}

	appendDepositButton(keyboard, args, insufficientAmounts)

	return keyboard
		.text(
			'Enter amount',
			buildActionData(actionIds.openWithdrawChooseAmount, undefined),
		)
		.row()
		.text(
			'Enter recipient',
			buildActionData(actionIds.promptWithdrawRecipient, undefined),
		)
		.appendNavButtons(navButtons)
}

function appendDepositButton(
	keyboard: InlineKeyboard,
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): void {
	if (args.kind === 'pending') return
	if (isSufficientAmounts(insufficientAmounts)) return

	const { currencyAmount, nativeBalance } = args

	if (isAmountInsufficient(currencyAmount, insufficientAmounts)) return

	const { currency } = nativeBalance

	keyboard
		.text(
			`Deposit ${currencyLabel(currency)}`,
			buildActionData(
				actionIds.openDepositAddress,
				currency.chainAddress,
			),
		)
		.row()
}
