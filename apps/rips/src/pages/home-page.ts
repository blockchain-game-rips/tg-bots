import { CurrencyAmountDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { formatAmountWithUsd, formatPercent } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'
import { PageContent } from '../types'

interface HomePageArgs {
	unopenedPulls: number
	baseBalance: CurrencyAmountDto
	referralFee: number
}

function statsLines(args: HomePageArgs): string[] {
	const lines: string[] = []

	if (args.unopenedPulls > 0) {
		lines.push(`🎁 Unopened pulls: ${args.unopenedPulls.toString()}`)
	}

	lines.push(`💰 Base balance: ${formatAmountWithUsd(args.baseBalance)}`)
	lines.push(`👥 Referral tier: ${formatPercent(args.referralFee)}`)

	return lines
}

function messageLines(args: HomePageArgs): string[] {
	if (args.unopenedPulls > 0) {
		return [
			`🎁 <b>You have ${args.unopenedPulls.toString()} unopened pulls</b>`,
			'',
			'Open them to reveal your cards.',
			'',
			...statsLines(args),
		]
	}

	const hasFunds = Number(args.baseBalance.amount) > 0

	if (hasFunds) {
		return [
			'👋 <b>Welcome to Rips</b>',
			'',
			"You're ready to go. Enter a live Rip to collect cards.",
			'',
			...statsLines(args),
		]
	}

	return [
		'👋 <b>Welcome to Rips</b>',
		'',
		'Enter live Rips, open your pulls, and collect cards.',
		'',
		'To get started, fund your wallet with ETH on Base.',
	]
}

export const HomePage = {
	render(args: HomePageArgs): PageContent {
		const lines = messageLines(args)

		const keyboard = new InlineKeyboard()
			.text('Play', buildActionData(actionIds.openPlay, undefined))
			.row()
			.text('Wallet', buildActionData(actionIds.openWallet, undefined))
			.row()
			.text(
				'Referral System',
				buildActionData(actionIds.openReferral, undefined),
			)
			.row()
			.text('About', buildActionData(actionIds.openAbout, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
