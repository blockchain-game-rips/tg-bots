import { getEnvSafe } from '@rips/grammy-kit'
import { Bot } from 'grammy'
import { pages, VariantError } from './pages'

const bot = new Bot(getEnvSafe('PREVIEW_BOT_TOKEN'))

const pageNames = Object.keys(pages)

bot.command('pages', async (ctx) => {
	const list = pageNames
		.map((name) => {
			const { variants } = pages[name] ?? {}

			if (!variants?.length) return `<code>${name}</code>`

			const [first, ...rest] = variants
			if (first === undefined) return `<code>${name}</code>`
			const indent = ' '.repeat(name.length)

			return [
				`<code>${name} ${first}</code>`,
				...rest.map((v) => `<code>${indent} ${v}</code>`),
			].join('\n')
		})
		.join('\n')

	await ctx.reply(`Available pages:\n\n${list}`, { parse_mode: 'HTML' })
})

bot.command('r', async (ctx) => {
	const [pageName, variant] = ctx.match.trim().split(' ')

	if (!pageName) {
		await ctx.reply('Usage: /r <page-name> [variant]')
		return
	}

	const page = pages[pageName]

	if (!page) {
		await ctx.reply(
			`Unknown page: "${pageName}"\n\nUse /pages to see available pages.`,
		)
		return
	}

	let rendered
	try {
		rendered = page.render(variant)
	} catch (e) {
		if (e instanceof VariantError) {
			const available = e.available
				.map((v) => `<code>${v}</code>`)
				.join(', ')
			const received = e.received ? `<code>${e.received}</code>` : 'none'
			await ctx.reply(
				`Unknown variant ${received} for page "${pageName}".\n\nAvailable: ${available}`,
				{ parse_mode: 'HTML' },
			)
			return
		}
		throw e
	}

	const { message, keyboard } = rendered

	await ctx.reply(message, {
		reply_markup: keyboard,
		parse_mode: 'HTML',
	})
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
