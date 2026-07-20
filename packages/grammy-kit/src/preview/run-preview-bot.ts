import { Bot, type Context } from 'grammy'
import { getEnvSafe } from '../utils/common'
import { PageEntry, VariantError } from './page-entry'

type Pages = Record<string, PageEntry | undefined>

async function renderVariant(
	ctx: Context,
	page: PageEntry,
	pageName: string,
	variant: string | undefined,
): Promise<void> {
	let rendered
	try {
		rendered = await page.render(variant)
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

	const { message, keyboard, photo } = rendered

	if (photo !== undefined) {
		await ctx.replyWithPhoto(photo, {
			caption: message,
			reply_markup: keyboard,
			parse_mode: 'HTML',
		})

		return
	}

	await ctx.reply(message, {
		reply_markup: keyboard,
		parse_mode: 'HTML',
	})
}

export function runPreviewBot(pages: Pages): void {
	const bot = new Bot(getEnvSafe('PREVIEW_BOT_TOKEN'))

	bot.command('pages', async (ctx) => {
		const list = Object.entries(pages)
			.map(([name, entry]) => {
				const variants = entry?.variants

				if (!variants?.length) return `<code>${name}</code>`

				const [first, ...rest] = variants
				const indent = ' '.repeat(name.length)

				return [
					`<code>${name} ${first ?? ''}</code>`,
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

		const shouldRenderAll = !variant && !!page.variants?.length

		if (shouldRenderAll) {
			for (const pageVariant of page.variants ?? []) {
				await renderVariant(ctx, page, pageName, pageVariant)
			}
			return
		}

		await renderVariant(ctx, page, pageName, variant)
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
		{
			command: 'r',
			description:
				'Render a page: /r <page-name> [variant] (omit variant to render all)',
		},
		{
			command: 'd',
			description: 'Describe a page: /d <page-name>',
		},
	])

	void bot.start()
}
