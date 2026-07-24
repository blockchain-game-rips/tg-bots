import { AvailablePresetDto, CurrencyAmountDto } from '@rips/api-client'
import { addNav, buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { configName, formatAmountWithUsd, resolveConfig } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { NATIVE_ON_BASE } from '../../constants'
import { PageContent } from '../../types'
import { chainToEmoji, chainToName } from '../../utils/chain'
import { isSameChainAddress } from '../../utils/currency'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

export const EnterChoosePaymentWalletPage = {
	render(args: {
		availablePreset: AvailablePresetDto
		entryCount: number
		balances: CurrencyAmountDto[]
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

const WALLET_TITLE = '💳 Choose payment wallet'

function buildMessage(
	config: ReturnType<typeof resolveConfig>,
	entryCount: number,
	entryTotal: CurrencyAmountDto,
	payableBalances: CurrencyAmountDto[],
): ReturnType<typeof joinLines> {
	const lines: Line[] = [
		enterBreadcrumb(configName(config)),
		'',
		WALLET_TITLE,
		'',
		`Entry total: ${formatAmountWithUsd(entryTotal)}`,
		`Entries: ${entryCount.toString()}`,
		'',
		'Available balances:',
	]

	for (const balance of payableBalances) {
		const { chain } = balance.currency.chainAddress

		lines.push('')
		lines.push(`${chainToEmoji(chain)} ${chainToName(chain)}`)
		lines.push(formatAmountWithUsd(balance))
	}

	return joinLines(lines)
}

function buildKeyboard(
	availablePreset: AvailablePresetDto,
	entryCount: number,
	payableBalances: CurrencyAmountDto[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	for (const balance of payableBalances) {
		keyboard
			.text(payLabel(balance), payActionData(balance, entryCount))
			.row()
	}

	keyboard
		.text(
			'Enter from another chain',
			buildActionData(actionIds.openZapChooseChain, undefined),
		)
		.row()

	return addNav(keyboard, {
		parent: actionIds.openChooseEntryAmount,
		parentPayload: availablePreset.preset.id,
		home: actionIds.openHome,
	})
}

function payLabel(balance: CurrencyAmountDto): string {
	const { chainAddress, symbol } = balance.currency

	return `Pay with ${chainToName(chainAddress.chain)} ${symbol}`
}

function payActionData(balance: CurrencyAmountDto, entryCount: number): string {
	if (isBaseNative(balance)) {
		return buildActionData(actionIds.openEnterCheckout, entryCount)
	}

	return buildActionData(
		actionIds.openZapConfirm,
		balance.currency.chainAddress,
	)
}

function isPayable(balance: CurrencyAmountDto): boolean {
	return isBaseNative(balance) || BigInt(balance.amount) > 0n
}

function isBaseNative(balance: CurrencyAmountDto): boolean {
	return isSameChainAddress(balance.currency.chainAddress, NATIVE_ON_BASE)
}

function entryTotalAmount(
	entryPrice: CurrencyAmountDto,
	entryCount: number,
): CurrencyAmountDto {
	const total = BigInt(entryPrice.amount) * BigInt(entryCount)

	return {
		amount: total.toString(),
		currency: entryPrice.currency,
	}
}
