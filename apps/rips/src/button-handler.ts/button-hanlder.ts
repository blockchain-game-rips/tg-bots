import { Filter, GrammyError } from 'grammy'
import { Context } from '../types'
import { composePageContentWithError } from '../utils/error-to-render'
import { handleButtonCommand } from './command-handler'
import { getCurrentPage, parseCommand } from './utils'

const processingUsers = new Set<number>()

export async function handleButton(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const userId = ctx.from.id

	if (processingUsers.has(userId)) return

	processingUsers.add(userId)

	try {
		return await handleButtonLogic(ctx)
	} catch (error) {
		if (error instanceof GrammyError) throw error

		const currentPageContent = getCurrentPage(ctx)
		const pageContent = composePageContentWithError(
			currentPageContent,
			error,
		)

		await ctx.editMessageText(pageContent.message, {
			reply_markup: pageContent.keyboard,
		})
	} finally {
		processingUsers.delete(userId)
	}
}

export async function handleButtonLogic(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	ctx.answerCallbackQuery().catch((error) => console.log(error))

	console.log('user press button, data:', ctx.callbackQuery.data)

	const command = parseCommand(ctx.callbackQuery.data)

	await handleButtonCommand(command, ctx)
}
