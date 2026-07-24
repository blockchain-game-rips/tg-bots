import { fmt, FormattedString } from '@grammyjs/parse-mode'
import { Bot, type Context } from 'grammy'
import { getEnvSafe } from '../utils/common'
import {
	groupPagesBySection,
	PageEntry,
	PageSection,
	VariantError,
} from './page-entry'

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
			const available = FormattedString.join(
				e.available.map((v) => FormattedString.code(v)),
				', ',
			)
			const received = e.received
				? FormattedString.code(e.received)
				: fmt`none`
			const message = fmt`Unknown variant ${received} for page "${pageName}".\n\nAvailable: ${available}`
			await ctx.reply(message.text, { entities: message.entities })
			return
		}
		throw e
	}

	const { message, keyboard, photo } = rendered

	if (photo !== undefined) {
		await ctx.replyWithPhoto(photo, {
			caption: message.caption,
			caption_entities: message.caption_entities,
			reply_markup: keyboard,
		})

		return
	}

	await ctx.reply(message.text, {
		reply_markup: keyboard,
		entities: message.entities,
	})
}

function formatPageLine(name: string, entry: PageEntry): FormattedString {
	const variants = entry.variants

	if (!variants?.length) return FormattedString.code(name)

	const [first, ...rest] = variants
	const indent = ' '.repeat(name.length)

	return FormattedString.join(
		[
			FormattedString.code(`${name} ${first ?? ''}`),
			...rest.map((v) => FormattedString.code(`${indent} ${v}`)),
		],
		'\n',
	)
}

export function runPreviewBot(
	pages: Pages,
	sections: PageSection[] = [],
): void {
	const bot = new Bot(getEnvSafe('PREVIEW_BOT_TOKEN'))

	bot.command('start', async (ctx) => {
		const message = fmt`This bot renders the user app's pages so you can preview them in Telegram.

${FormattedString.b('Getting started')}
1. ${FormattedString.code('/pages')} — list every page and its variants.
2. Pick a page name from that list.
3. ${FormattedString.code('/r <page-name> [variant]')} — render it. Omit the variant to render all of them.

${FormattedString.b('Commands')}
${FormattedString.code('/pages')} — list all available pages.
${FormattedString.code('/r <page-name> [variant]')} — render a page.
${FormattedString.code('/d <page-name>')} — describe what a page is.

${FormattedString.b('Example')}
${FormattedString.code('/r checkout crosschain-sufficient')}`

		await ctx.reply(message.text, { entities: message.entities })
	})

	bot.command('pages', async (ctx) => {
		const groups = groupPagesBySection(pages, sections)

		const blocks = groups.map((group) => {
			const lines = group.pages.map(([name, entry]) =>
				formatPageLine(name, entry),
			)

			const list = FormattedString.join(lines, '\n')

			if (group.section === undefined) return list

			return fmt`${FormattedString.b(group.section.title)}\n${list}`
		})

		const body = FormattedString.join(blocks, '\n\n')
		const message = fmt`Available pages:\n\n${body}`

		await ctx.reply(message.text, { entities: message.entities })
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
		{ command: 'start', description: 'How to use this bot' },
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
