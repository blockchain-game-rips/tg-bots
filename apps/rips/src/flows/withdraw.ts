import { getBalance, withdraw } from '../api/endpoints/wallets'
import { ConfirmWithdrawPage } from '../pages/content/confirm-withdraw-page'
import { SuccessWithdrawPage } from '../pages/content/success-withdraw-page'
import { WithdrawAddressPrompt } from '../prompts/withdraw-address-prompt'
import { ActiveFlow, Context, PageContent, WithdrawStep } from '../types'
import { ErrorToRender } from '../utils/error-to-render'

const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

export async function enterChoosingAddressStep(
	ctx: Context,
	amount: string,
	messageToEdit: { pageContent: PageContent; messageId: number },
): Promise<null> {
	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.WaitingForAddress,
		amount,
		messageToEdit,
	}

	const promptContent = WithdrawAddressPrompt.render()

	await ctx.reply(promptContent.message, {
		reply_markup: {
			force_reply: true,
			input_field_placeholder: promptContent.placeholder,
		},
	})

	return null
}

export async function enterConfirmWithdrawStep(
	ctx: Context,
	amount: string,
	recipientAddress: string,
): Promise<PageContent> {
	if (!EVM_ADDRESS_REGEX.test(recipientAddress)) {
		throw new ErrorToRender('Invalid address format')
	}

	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const balance = await getBalance(telegramId)

	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.Confirming,
		amount,
		recipientAddress,
	}

	return ConfirmWithdrawPage.render(BigInt(amount), recipientAddress, balance)
}

export async function enterWithdrawalStep(
	ctx: Context,
	amount: string,
	recipientAddress: string,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const [result, balance] = await Promise.all([
		withdraw(telegramId, BigInt(amount), recipientAddress),
		getBalance(telegramId),
	])

	ctx.session = { activeFlow: null }

	return SuccessWithdrawPage.render(result, BigInt(amount), balance)
}
