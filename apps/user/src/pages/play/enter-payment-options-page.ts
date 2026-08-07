import {
	AvailablePresetDtoOutput,
	CurrencyAmountDtoOutput,
} from '@rips/api-client'
import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { configName, formatAmountWithUsd, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { NATIVE_ON_BASE } from '../../constants'
import { PageContent } from '../../types'
import { chainToEmoji, chainToName } from '../../utils/chain'
import { isSameChainAddress } from '../../utils/currency'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const EnterPaymentOptionsPage = {
	render(args: {
		availablePreset: AvailablePresetDtoOutput
		entryCount: number
		balances: CurrencyAmountDtoOutput[]
	}): PageContent {
		const { availablePreset, entryCount, balances } = args

		const config = resolveConfig(availablePreset)
		const entryTotal = entryTotalAmount(config.entryPrice, entryCount)

		const payableBalances = balances.filter(isPayable)

		return {
			message: buildMessage(
				config,
				entryCount,
				entryTotal,
				payableBalances,
			),
			keyboard: buildKeyboard(
				availablePreset,
				entryCount,
				payableBalances,
			),
		}
	},
}

const PAYMENT_TOKEN_TITLE = '🪙 Choose payment token'

function buildMessage(
	config: ReturnType<typeof resolveConfig>,
	entryCount: number,
	entryTotal: CurrencyAmountDtoOutput,
	payableBalances: CurrencyAmountDtoOutput[],
): ReturnType<typeof joinLines> {
	const lines: Line[] = [
		enterBreadcrumb(configName(config)),
		'',
		PAYMENT_TOKEN_TITLE,
		'',
		`Entry total: ${formatAmountWithUsd(entryTotal)}`,
		`Entries: ${entryCount.toString()}`,
		'',
		'Available balances:',
	]

	for (const balance of groupByChain(payableBalances)) {
		if (balance.kind === 'chain') {
			lines.push('')
			lines.push(
				`${chainToEmoji(balance.chain)} ${chainToName(balance.chain)}`,
			)

			continue
		}

		lines.push(formatAmountWithUsd(balance.balance))
	}

	return joinLines(lines)
}

type GroupedLine =
	| {
			kind: 'chain'
			chain: CurrencyAmountDtoOutput['currency']['chainAddress']['chain']
	  }
	| { kind: 'balance'; balance: CurrencyAmountDtoOutput }

function groupByChain(balances: CurrencyAmountDtoOutput[]): GroupedLine[] {
	const lines: GroupedLine[] = []

	let currentChainId: string | undefined

	for (const balance of balances) {
		const { chain } = balance.currency.chainAddress
		const chainId = `${chain.namespace}:${chain.reference}`

		if (chainId !== currentChainId) {
			lines.push({ kind: 'chain', chain })
			currentChainId = chainId
		}

		lines.push({ kind: 'balance', balance })
	}

	return lines
}

function buildKeyboard(
	availablePreset: AvailablePresetDtoOutput,
	entryCount: number,
	payableBalances: CurrencyAmountDtoOutput[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const balance of payableBalances) {
		keyboard
			.text(payLabel(balance), payActionData(balance, entryCount))
			.row()
	}

	keyboard
		.text(
			'Pay from another chain',
			buildActionData(actionIds.openEnterChoosePaymentChain, undefined),
		)
		.row()

	return keyboard.appendNavButtons({
		parent: actionIds.openChooseEntryAmount,
		parentPayload: availablePreset.preset.id,
		home: actionIds.openHome,
	})
}

function payLabel(balance: CurrencyAmountDtoOutput): string {
	const { chainAddress, symbol } = balance.currency

	return `${chainToName(chainAddress.chain)} ${symbol}`
}

function payActionData(
	balance: CurrencyAmountDtoOutput,
	entryCount: number,
): string {
	if (isBaseNative(balance)) {
		return buildActionData(actionIds.openEnterCheckout, entryCount)
	}

	return buildActionData(
		actionIds.openZapConfirm,
		balance.currency.chainAddress,
	)
}

function isPayable(balance: CurrencyAmountDtoOutput): boolean {
	return isBaseNative(balance) || BigInt(balance.amount) > 0n
}

function isBaseNative(balance: CurrencyAmountDtoOutput): boolean {
	return isSameChainAddress(balance.currency.chainAddress, NATIVE_ON_BASE)
}

function entryTotalAmount(
	entryPrice: CurrencyAmountDtoOutput,
	entryCount: number,
): CurrencyAmountDtoOutput {
	const total = BigInt(entryPrice.amount) * BigInt(entryCount)

	return {
		amount: total.toString(),
		currency: entryPrice.currency,
	}
}
