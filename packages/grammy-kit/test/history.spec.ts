import { FormattedString } from '@grammyjs/parse-mode'
import {
	ActionId,
	BACK_ACTION_ID,
	COMMAND_SEPARATOR,
	EffectType,
	HistoryEntry,
	MAX_HISTORY_DEPTH,
	PageContent,
	recordPage,
	resolveNavigation,
	SessionData,
} from '@rips/grammy-kit'
import { InlineKeyboard, InputFile } from 'grammy'

const makeSession = (): SessionData => ({
	telegramId: '1',
	lastAsk: null,
	flow: null,
	lastNavigatedPage: null,
	history: [],
})

const makePage = (text: string): PageContent => ({
	message: new FormattedString(text, []),
	keyboard: new InlineKeyboard(),
})

const actionEntry = (actionId: string, payload?: string): HistoryEntry => ({
	kind: 'action',
	action: { actionId, payload },
})

const currentEntry = (session: SessionData): HistoryEntry | null =>
	session.history[session.history.length - 1] ?? null

const enter = (session: SessionData, actionId: string, payload?: string) => {
	recordPage(
		session,
		{ actionId, payload },
		{ type: EffectType.NAVIGATE, page: makePage(actionId) },
	)
}

const enterWithoutAction = (session: SessionData, page: PageContent) => {
	recordPage(
		session,
		{ actionId: 'unused', payload: undefined },
		{ type: EffectType.NAVIGATE, page, history: { kind: 'page' } },
	)
}

const enterAsRoot = (session: SessionData, actionId: string) => {
	recordPage(
		session,
		{ actionId, payload: undefined },
		{
			type: EffectType.NAVIGATE,
			page: makePage(actionId),
			history: { clears: true },
		},
	)
}

/**
 * Goes back the way the executor does: resolve the entry to render, then record
 * the rendered page under the back action.
 */
const goBack = (session: SessionData): HistoryEntry | null => {
	const navigation = resolveNavigation(session, {
		actionId: BACK_ACTION_ID,
		payload: undefined,
	})

	if (navigation.kind !== 'back') return null

	const entry = navigation.to

	const page = entry.kind === 'page' ? entry.page : makePage('rerun')

	recordPage(
		session,
		{ actionId: BACK_ACTION_ID, payload: undefined },
		{ type: EffectType.NAVIGATE, page },
	)

	return entry
}

describe('recordPage', () => {
	it('puts the page on screen at the top of the history', () => {
		const session = makeSession()

		enter(session, 'home')

		expect(currentEntry(session)).toEqual(actionEntry('home'))
	})

	it('keeps the rendered page for error messages', () => {
		const session = makeSession()
		const page = makePage('home')

		recordPage(
			session,
			{ actionId: 'home', payload: undefined },
			{ type: EffectType.NAVIGATE, page },
		)

		expect(session.lastNavigatedPage).toBe(page)
	})

	it('keeps the pages behind the one on screen, in the order visited', () => {
		const session = makeSession()

		enter(session, 'home')
		enter(session, 'preset')

		expect(session.history).toEqual([
			actionEntry('home'),
			actionEntry('preset'),
		])
	})

	it('keeps the payload, so two views of the same page stay distinct', () => {
		const session = makeSession()

		enter(session, 'rip', '1')
		enter(session, 'rip', '2')

		expect(session.history).toEqual([
			actionEntry('rip', '1'),
			actionEntry('rip', '2'),
		])
	})

	it('replaces the page on screen when it refreshes itself', () => {
		const session = makeSession()

		enter(session, 'home')
		enter(session, 'wallet')
		enter(session, 'wallet')
		enter(session, 'wallet')

		expect(session.history).toEqual([
			actionEntry('home'),
			actionEntry('wallet'),
		])
	})

	it('keeps both visits of a genuine there-and-back-again', () => {
		const session = makeSession()

		enter(session, 'a')
		enter(session, 'b')
		enter(session, 'a')

		expect(session.history).toEqual([
			actionEntry('a'),
			actionEntry('b'),
			actionEntry('a'),
		])
	})

	it('drops the oldest page once the history is full', () => {
		const session = makeSession()

		const visits = MAX_HISTORY_DEPTH + 5

		for (let index = 0; index < visits; index++) {
			enter(session, `page-${String(index)}`)
		}

		expect(session.history).toHaveLength(MAX_HISTORY_DEPTH)
		expect(session.history[0]).toEqual(actionEntry('page-5'))
	})
})

describe('recordPage with a page entry', () => {
	it('keeps the render, since no action would reproduce it', () => {
		const session = makeSession()
		const page = makePage('you won')

		enter(session, 'reveal')
		enterWithoutAction(session, page)

		expect(currentEntry(session)).toEqual({ kind: 'page', page })
	})

	it('keeps the pages behind it reachable', () => {
		const session = makeSession()

		enter(session, 'rip', '7')
		enter(session, 'reveal')
		enterWithoutAction(session, makePage('you won'))

		goBack(session)

		expect(currentEntry(session)).toEqual(actionEntry('reveal'))
	})

	it('ignores a photo page rather than holding its image buffer', () => {
		const session = makeSession()

		enter(session, 'reveal')
		enterWithoutAction(session, {
			...makePage('you won'),
			photo: new InputFile(Buffer.from('image')),
		})

		expect(currentEntry(session)).toEqual(actionEntry('reveal'))
	})

	it('stacks pages that claim no trail slot, since nothing marks them alike', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterWithoutAction(session, makePage('first'))
		enterWithoutAction(session, makePage('second'))

		expect(session.history).toHaveLength(3)
	})
})

describe('recordPage with a trail slot', () => {
	const SLOT = 'reveal-result'

	const enterSlot = (session: SessionData, text: string, slot = SLOT) => {
		enterWithoutAction(session, { ...makePage(text), trailSlot: slot })
	}

	it('supersedes the page holding the slot, keeping only the latest', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'first card')
		enterSlot(session, 'second card')
		enterSlot(session, 'third card')

		expect(session.history).toEqual([
			actionEntry('hub'),
			{
				kind: 'page',
				page: { ...makePage('third card'), trailSlot: SLOT },
			},
		])
	})

	it('leaves for the page behind it, however many times it refreshed', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'first card')
		enterSlot(session, 'second card')
		enterSlot(session, 'third card')

		expect(goBack(session)).toEqual(actionEntry('hub'))
	})

	it('lets a different page claim the same slot, so either supersedes the other', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'single reveal')
		enterSlot(session, 'batch reveal')

		expect(goBack(session)).toEqual(actionEntry('hub'))
	})

	it('stacks against a page holding a different slot', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'reveal')
		enterSlot(session, 'summary', 'reveal-summary')

		expect(session.history).toHaveLength(3)
	})

	it('keeps a page opened on top of it, so back returns to the latest', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'first card')
		enterSlot(session, 'second card')
		enter(session, 'collection')

		expect(goBack(session)).toEqual({
			kind: 'page',
			page: { ...makePage('second card'), trailSlot: SLOT },
		})
	})

	it('stacks a revisit made after leaving, since the trail moved on', () => {
		const session = makeSession()

		enter(session, 'hub')
		enterSlot(session, 'first card')
		enter(session, 'collection')
		enterSlot(session, 'second card')

		expect(session.history).toHaveLength(4)
	})
})

describe('recordPage with a sensitive page', () => {
	const enterSensitive = (session: SessionData, actionId: string) => {
		recordPage(
			session,
			{ actionId, payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: { ...makePage(actionId), sensitive: true },
			},
		)
	}

	it('keeps no render of it, so the secret never reaches session storage', () => {
		const session = makeSession()

		enter(session, 'export-key-warning')
		enterSensitive(session, 'export-key')

		expect(session.lastNavigatedPage).toBeNull()
	})

	it('stays off the trail, so no back press can return to the secret', () => {
		const session = makeSession()

		enter(session, 'wallet')
		enter(session, 'export-key-warning')
		enterSensitive(session, 'export-key')

		expect(session.history).toEqual([
			actionEntry('wallet'),
			actionEntry('export-key-warning'),
		])
	})

	it('leaves past the page that warned about it', () => {
		const session = makeSession()

		enter(session, 'wallet')
		enter(session, 'export-key-warning')
		enterSensitive(session, 'export-key')

		expect(goBack(session)).toEqual(actionEntry('wallet'))
	})
})

describe('recordPage with replayWith', () => {
	const SECRET = '0xprivatekey'

	const REPLAY_ACTION = 'home' as ActionId

	const CURRENCY = '7'

	const submitSecret = (session: SessionData, clears = false) => {
		recordPage(
			session,
			{ actionId: 'import-key', payload: SECRET },
			{
				type: EffectType.NAVIGATE,
				page: makePage('home'),
				history: { clears, replayWith: REPLAY_ACTION },
			},
		)
	}

	it('records the named action instead of the one that ran', () => {
		const session = makeSession()

		enter(session, 'checkout')
		recordPage(
			session,
			{ actionId: 'buy-entries', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: makePage('bought'),
				history: { replayWith: REPLAY_ACTION },
			},
		)

		expect(currentEntry(session)).toEqual(actionEntry('home'))
	})

	it('goes back to it rather than repeating the action that ran', () => {
		const session = makeSession()

		enter(session, 'checkout')
		recordPage(
			session,
			{ actionId: 'buy-entries', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: makePage('bought'),
				history: { replayWith: REPLAY_ACTION },
			},
		)
		enter(session, 'collection')

		expect(goBack(session)).toEqual(actionEntry('home'))
	})

	it('keeps the typed secret out of the trail', () => {
		const session = makeSession()

		enter(session, 'welcome')
		submitSecret(session)

		expect(JSON.stringify(session.history)).not.toContain(SECRET)
	})

	it('keeps it out even when the page it lands on starts a fresh trail', () => {
		const session = makeSession()

		enter(session, 'welcome')
		submitSecret(session, true)

		expect(JSON.stringify(session.history)).not.toContain(SECRET)
	})

	it('still shows the page it landed on, since only the payload is secret', () => {
		const session = makeSession()

		submitSecret(session)

		expect(session.lastNavigatedPage?.message.text).toBe('home')
	})

	it('carries a payload the replayed action needs to render', () => {
		const session = makeSession()

		enter(session, 'choose-currency')
		recordPage(
			session,
			{ actionId: 'deposit-qr', payload: CURRENCY },
			{
				type: EffectType.NAVIGATE,
				page: makePage('deposit'),
				history: {
					replayWith: `deposit${COMMAND_SEPARATOR}${CURRENCY}`,
				},
			},
		)

		expect(currentEntry(session)).toEqual(actionEntry('deposit', CURRENCY))
	})

	it('collapses states of one page so back leaves it', () => {
		const session = makeSession()

		const showState = (actionId: string) => {
			recordPage(
				session,
				{ actionId, payload: CURRENCY },
				{
					type: EffectType.NAVIGATE,
					page: makePage(actionId),
					history: {
						replayWith: `deposit${COMMAND_SEPARATOR}${CURRENCY}`,
					},
				},
			)
		}

		enter(session, 'choose-currency')
		showState('deposit')
		showState('deposit-qr')
		showState('deposit')
		showState('deposit-qr')

		expect(goBack(session)).toEqual(actionEntry('choose-currency'))
	})
})

describe('recordPage clearing the history', () => {
	it('leaves the page as the only one, so there is nowhere to go back to', () => {
		const session = makeSession()

		enter(session, 'a')
		enter(session, 'b')
		enterAsRoot(session, 'home')

		expect(session.history).toEqual([actionEntry('home')])
		expect(goBack(session)).toBeNull()
	})

	it('starts a fresh trail that goes back to it', () => {
		const session = makeSession()

		enterAsRoot(session, 'home')
		enter(session, 'wallet')

		expect(goBack(session)).toEqual(actionEntry('home'))
	})

	it('seeds an empty history, so the first page needs no special casing', () => {
		const session = makeSession()

		enterAsRoot(session, 'home')

		expect(session.history).toEqual([actionEntry('home')])
	})

	it('keeps the render when the page is also the start of the trail', () => {
		const session = makeSession()
		const page = makePage('welcome')

		enter(session, 'a')
		recordPage(
			session,
			{ actionId: 'welcome', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page,
				history: { kind: 'page', clears: true },
			},
		)

		expect(session.history).toEqual([{ kind: 'page', page }])
	})
})

describe('resolveNavigation', () => {
	const back = { actionId: BACK_ACTION_ID, payload: undefined }

	it('sends a normal action forward to its own handler', () => {
		const session = makeSession()

		enter(session, 'home')

		const action = { actionId: 'wallet', payload: undefined }

		expect(resolveNavigation(session, action)).toEqual({
			kind: 'forward',
			action,
		})
	})

	it('reports at-root when there is nowhere to go back to', () => {
		const session = makeSession()

		enter(session, 'home')

		expect(resolveNavigation(session, back)).toEqual({ kind: 'at-root' })
	})

	it('points back at the page behind the one on screen', () => {
		const session = makeSession()

		enter(session, 'home')
		enter(session, 'wallet')

		expect(resolveNavigation(session, back)).toEqual({
			kind: 'back',
			to: actionEntry('home'),
		})
	})
})

describe('going back', () => {
	it('returns null when the first page is the only one', () => {
		const session = makeSession()

		enter(session, 'home')

		expect(goBack(session)).toBeNull()
	})

	it('returns null when nothing has been entered yet', () => {
		expect(goBack(makeSession())).toBeNull()
	})

	it('returns the page behind the one on screen', () => {
		const session = makeSession()

		enter(session, 'home')
		enter(session, 'preset')

		expect(goBack(session)).toEqual(actionEntry('home'))
	})

	it('unwinds one page per press, in reverse order of visiting', () => {
		const session = makeSession()

		enter(session, 'a')
		enter(session, 'b')
		enter(session, 'e')

		expect(goBack(session)).toEqual(actionEntry('b'))
		expect(goBack(session)).toEqual(actionEntry('a'))
		expect(goBack(session)).toBeNull()
	})

	it('follows the path actually taken when a page has several entrances', () => {
		const viaHome = makeSession()

		enter(viaHome, 'a')
		enter(viaHome, 'b')
		enter(viaHome, 'e')

		const viaWallet = makeSession()

		enter(viaWallet, 'd')
		enter(viaWallet, 'b')
		enter(viaWallet, 'e')

		expect(goBack(viaHome)).toEqual(actionEntry('b'))
		expect(goBack(viaHome)).toEqual(actionEntry('a'))

		expect(goBack(viaWallet)).toEqual(actionEntry('b'))
		expect(goBack(viaWallet)).toEqual(actionEntry('d'))
	})

	it('leaves the page it returns to on screen, so leaving again moves on', () => {
		const session = makeSession()

		enter(session, 'a')
		enter(session, 'b')
		enter(session, 'c')

		goBack(session)

		expect(currentEntry(session)).toEqual(actionEntry('b'))

		enter(session, 'c')

		expect(session.history).toEqual([
			actionEntry('a'),
			actionEntry('b'),
			actionEntry('c'),
		])
	})
})
