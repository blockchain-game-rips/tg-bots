import { Filter } from 'grammy'
import { parseCommand } from './commands'
import {
	enterConfirmingStep,
	enterTicketAmountStep,
} from './flows/ticket-purchase'
import { AboutPage } from './pages/about/about-page'
import { ChooseStakePage } from './pages/choose-stake/choose-stake-page'
import { HomePage } from './pages/home/home-page'
import { PageContent } from './pages/interfaces'
import { pageIds } from './pages/page-ids'
import { PlayPage } from './pages/play/play-page'
import { CustomTicketAmountPrompt } from './prompts/custom-ticket-amount-prompt'
import { promptIds } from './prompts/prompt-ids'
import { getStakesMock } from './services/stake.service'
import { ActiveFlow, Context, TicketPurchaseStep } from './types'

async function editMessage(ctx: Context, pageContent: PageContent) {
	await ctx.editMessageText(pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
}

export async function handleButton(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	void ctx.answerCallbackQuery()

	console.log('user press button, data:', ctx.callbackQuery.data)

	const command = parseCommand(ctx.callbackQuery.data)

	switch (command.type) {
		case 'open': {
			const pageContent = await openPage(
				ctx,
				command.pageId,
				command.payloads,
			)

			if (pageContent) {
				await editMessage(ctx, pageContent)
			}

			break
		}

		case 'reply': {
			switch (command.promptId) {
				case promptIds.customTicketAmount: {
					if (ctx.session.activeFlow !== ActiveFlow.TicketPurchase) {
						throw new Error('activeFlow should be ticket-purchase')
					}

					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.WaitingForInput,
						messageIdToEdit:
							ctx.update.callback_query.message!.message_id,
						stakeId: ctx.session.stakeId,
					}

					const promptContent = CustomTicketAmountPrompt.render()

					await ctx.reply(promptContent.message, {
						reply_markup: {
							force_reply: true,
							input_field_placeholder: promptContent.placeholder,
						},
					})

					break
				}
			}

			break
		}
	}
}

async function openPage(
	ctx: Context,
	pageId: string,
	payloads?: string[],
): Promise<PageContent | null> {
	switch (pageId) {
		case pageIds.home:
			return HomePage.render()

		case pageIds.about:
			return AboutPage.render()

		case pageIds.play:
			return PlayPage.render()

		case pageIds.chooseStake: {
			const stakes = await getStakesMock()
			return ChooseStakePage.render(stakes)
		}

		case pageIds.chooseTicketAmount: {
			const stakeId = payloads?.[0]

			if (stakeId === undefined) {
				throw Error('stakeId is required for chooseTicketAmount')
			}

			return await enterTicketAmountStep(ctx, stakeId)
		}

		case pageIds.confirmPurchase: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
				sessionData.step !== TicketPurchaseStep.ChoosingTicketAmount
			) {
				throw Error('wrong session state for confirmPurchase')
			}

			const ticketAmount = Number(payloads![0])

			return await enterConfirmingStep(
				ctx,
				sessionData.stakeId,
				ticketAmount,
			)
		}

		default:
			throw Error(`unknown pageId: ${pageId}`)
	}
}
