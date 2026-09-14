import { describe, expect, it } from 'vitest'
import { MINI_APP_PAGE, MIN_VISIBLE_MS } from '../src/gate/mini-app-page'

/**
 * The page is a string constant holding inline CSS and JS, so there is no unit
 * under test in the usual sense. What is worth pinning is the part a later edit
 * could silently break: the copy the spec fixes, and the things the page must
 * never say. Both are decisions from the issue rather than implementation
 * detail, which is why they are asserted rather than left to review.
 */
const CAPTION_FIRST_LINE = 'Checking your region.'
const CAPTION_SECOND_LINE = 'The result will arrive in the chat.'

const ERROR_FIRST_LINE = 'Something went wrong.'
const ERROR_SECOND_LINE = 'Please close this window and try again.'

/**
 * The gate returns `{telegramId, country}` and the *bot* decides, so the page
 * does not know the outcome. Any of these appearing in the markup would mean it
 * had started to pretend otherwise.
 */
const VERDICT_MARKERS = [
	'eligible',
	'ineligible',
	'allowed',
	'blocked',
	'denied',
	'verdict',
	'country',
	'<pre',
	'✅',
	'⛔',
]

/** Telegram guidelines clause 7.4 keeps all of this off the page entirely. */
const FORBIDDEN_TOPIC_MARKERS = [
	'base',
	'token',
	'wallet',
	'buy',
	'purchase',
	'price',
	'crypto',
	'dapp',
]

const lower = MINI_APP_PAGE.toLowerCase()

/**
 * What a user actually reads: the markup stripped of its `<style>` and
 * `<script>` blocks and of tags themselves. The forbidden-topic check runs
 * against this rather than the whole page, so a CSS class or a script
 * identifier can never fail a test about user-visible copy.
 */
const visibleText = MINI_APP_PAGE.replace(
	/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/g,
	' ',
)
	.replace(/<[^>]+>/g, ' ')
	.toLowerCase()

/**
 * The page's behaviour, which lives in the one inline `<script>` that has a
 * body — the Telegram bootstrap is a `src` tag with nothing inside it. Checks
 * about what the page *does* read this rather than the whole page, so prose in
 * a comment naming what the code deliberately avoids cannot fail them.
 */
const inlineScript = [
	...MINI_APP_PAGE.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g),
]
	.map(([, body]) => body ?? '')
	.join('\n')
	.replace(/^\s*\/\/.*$/gm, '')

describe('the mini app page as a loader', () => {
	it('shows the two caption lines the spec fixes', () => {
		expect(MINI_APP_PAGE).toContain(CAPTION_FIRST_LINE)
		expect(MINI_APP_PAGE).toContain(CAPTION_SECOND_LINE)
	})

	it('carries the error copy for a failed request', () => {
		expect(MINI_APP_PAGE).toContain(ERROR_FIRST_LINE)
		expect(MINI_APP_PAGE).toContain(ERROR_SECOND_LINE)
	})

	it('never renders a verdict, a country or debug output', () => {
		const present = VERDICT_MARKERS.filter((marker) =>
			lower.includes(marker.toLowerCase()),
		)

		expect(present).toEqual([])
	})

	it('names no token, no chain and no purchase flow', () => {
		const present = FORBIDDEN_TOPIC_MARKERS.filter((marker) =>
			visibleText.includes(marker),
		)

		expect(present).toEqual([])
	})

	it('reads the rendered copy, not the stylesheet or the script', () => {
		expect(visibleText).toContain('checking your region.')
		expect(visibleText).not.toContain('keyframes')
		expect(visibleText).not.toContain('fetch(')
	})

	it('links nowhere except the telegram web app script', () => {
		const urls = [...MINI_APP_PAGE.matchAll(/https?:\/\/[^"'\s)]+/g)].map(
			([url]) => url,
		)

		expect(urls).toEqual(['https://telegram.org/js/telegram-web-app.js'])
	})
})

describe('the mini app page as a designed surface', () => {
	it('uses telegram theme variables so it matches the client', () => {
		expect(MINI_APP_PAGE).toContain('--tg-theme-bg-color')
		expect(MINI_APP_PAGE).toContain('--tg-theme-text-color')
	})

	it('uses the system font stack rather than a serif default', () => {
		expect(MINI_APP_PAGE).toContain('-apple-system')
		expect(MINI_APP_PAGE).toContain('system-ui')
	})

	it('animates a spinner and degrades it under prefers-reduced-motion', () => {
		expect(MINI_APP_PAGE).toContain('@keyframes')
		expect(MINI_APP_PAGE).toContain('prefers-reduced-motion')
	})
})

describe('how long the mini app page stays up', () => {
	it('holds the floor the page waits out before it closes', () => {
		expect(MINI_APP_PAGE).toContain(
			`MIN_VISIBLE_MS = ${String(MIN_VISIBLE_MS)}`,
		)
	})

	it('awaits the response behind the floor rather than racing it', () => {
		expect(inlineScript).not.toContain('Promise.all')
		expect(inlineScript).toContain('held.then')
	})

	it('sets no ceiling on a request still in flight', () => {
		const script = inlineScript.toLowerCase()

		expect(script).not.toContain('settimeout(() => tg.close')
		expect(script).not.toContain('abort')
	})

	it('posts initData to the verify route', () => {
		expect(MINI_APP_PAGE).toContain("fetch('/verify'")
		expect(MINI_APP_PAGE).toContain('initData')
	})
})
