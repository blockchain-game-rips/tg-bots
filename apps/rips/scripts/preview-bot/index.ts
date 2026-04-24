import { Bot } from 'grammy'
import { getEnvSafe } from '../../src/utils/common'
import { pages } from './pages'

const bot = new Bot(getEnvSafe('PREVIEW_BOT_TOKEN'))

const pageNames = Object.keys(pages)

bot.command('pages', async (ctx) => {
	const list = pageNames.map((name) => `${name}`).join('\n')

	await ctx.reply(`Available pages:\n\n${list}`)
})

bot.command('r', async (ctx) => {
	const pageName = ctx.match.trim()

	if (!pageName) {
		await ctx.reply('Usage: /render <page-name>')
		return
	}

	const page = pages[pageName]

	if (!page) {
		await ctx.reply(
			`Unknown page: "${pageName}"\n\nUse /pages to see available pages.`,
		)
		return
	}

	const { message, keyboard } = page.render()

	await ctx.reply(message, { reply_markup: keyboard })
})

bot.command('d', async (ctx) => {
	const pageName = ctx.match.trim()

	if (!pageName) {
		await ctx.reply('Usage: /description <page-name>')
		return
	}

	const page = pages[pageName]

	if (!page) {
		await ctx.reply(
			`Unknown page: "${pageName}"\n\nUse /pages to see available pages.`,
		)
		return
	}

	await ctx.reply(page.description)
})

void bot.api.setMyCommands([
	{ command: 'pages', description: 'List all available pages' },
	{ command: 'r', description: 'Render a page: /r <page-name>' },
	{
		command: 'd',
		description: 'Describe a page: /d <page-name>',
	},
])

void bot.start()
