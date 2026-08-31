import { Chain } from '@rips/shared'
import { CurrencyAmountDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { BASE_CHAIN, isNativeChainAddress } from '../../constants'
import { PageContent } from '../../types'
import { currencyToChain } from '@rips/shared'
import * as labels from '../../utils/button-labels'
import { chainToEmoji, chainToName } from '../../utils/chain'

function isZeroAmount(balance: CurrencyAmountDtoOutput): boolean {
	return BigInt(balance.amount) === 0n
}

function isBaseChain(chain: Chain): boolean {
	return (
		chain.namespace === BASE_CHAIN.namespace &&
		chain.reference === BASE_CHAIN.reference
	)
}

function groupBalancesByChain(
	balances: CurrencyAmountDtoOutput[],
): Map<string, CurrencyAmountDtoOutput[]> {
	const groups = new Map<string, CurrencyAmountDtoOutput[]>()

	for (const balance of balances) {
		const { namespace, reference } = currencyToChain(balance.currency)
		const key = `${namespace}:${reference}`

		const group = groups.get(key) ?? []
		group.push(balance)
		groups.set(key, group)
	}

	return groups
}

function nativeLine(nativeBalance: CurrencyAmountDtoOutput): string {
	if (isZeroAmount(nativeBalance)) {
		return `0 ${nativeBalance.currency.symbol}`
	}

	return formatAmountWithUsd(nativeBalance)
}

function chainBalanceLines(chainBalances: CurrencyAmountDtoOutput[]): string[] {
	const nativeBalance = chainBalances.find((balance) =>
		isNativeChainAddress(balance.currency.chainAddress),
	)

	if (nativeBalance === undefined) {
		throw new Error('Native balance not found for chain')
	}

	const chain = currencyToChain(nativeBalance.currency)

	const tokenLines = chainBalances
		.filter(
			(balance) =>
				!isNativeChainAddress(balance.currency.chainAddress) &&
				!isZeroAmount(balance),
		)
		.map((balance) => formatAmountWithUsd(balance))

	return [
		`${chainToEmoji(chain)} ${chainToName(chain)}`,
		nativeLine(nativeBalance),
		...tokenLines,
		'',
	]
}

export const WalletPage = {
	render(balances: CurrencyAmountDtoOutput[]): PageContent {
		const settlementHeader = `${chainToEmoji(BASE_CHAIN)} ${chainToName(BASE_CHAIN)}`

		const groups = [...groupBalancesByChain(balances).values()]

		// Base is the settlement chain and is always listed first.
		const baseGroup = groups.find((group) =>
			group.some((balance) =>
				isBaseChain(currencyToChain(balance.currency)),
			),
		)

		const orderedGroups =
			baseGroup === undefined
				? groups
				: [baseGroup, ...groups.filter((group) => group !== baseGroup)]

		const balanceLines = orderedGroups.flatMap((group) =>
			chainBalanceLines(group),
		)

		const lines: Line[] = [
			FormattedString.b('💼 Wallet'),
			'',
			'Main settlement chain:',
			settlementHeader,
			'',
			'Balances:',
			'',
			...balanceLines,
		]

		const keyboard = new InlineKeyboard()
			.text(
				labels.DEPOSIT,
				buildActionData(actionIds.openDeposit, undefined),
			)
			.row()
			.text(
				labels.WITHDRAW,
				buildActionData(actionIds.openWithdrawChooseChain, undefined),
			)
			.row()
			.text(
				labels.BRIDGE_SWAP,
				buildActionData(actionIds.openSwapChooseSrcChain, undefined),
			)
			.row()
			.text(
				labels.EXPORT_PRIVATE_KEY,
				buildActionData(actionIds.openExportKeyWarning, undefined),
			)
			.row()
			.text(
				labels.REFRESH_BALANCES,
				buildActionData(actionIds.openWallet, undefined),
			)
			.row()

		keyboard.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}
