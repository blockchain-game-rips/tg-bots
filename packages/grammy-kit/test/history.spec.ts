import { FormattedString } from '@grammyjs/parse-mode'
import {
	BACK_ACTION_ID,
	EffectType,
	HistoryEntry,
	MAX_HISTORY_DEPTH,
	PageContent,
	previousEntry,
	recordPage,
	SessionData,
} from '@rips/grammy-kit'
import { InlineKeyboard, InputFile } from 'grammy'

const makeSession = (): SessionData => ({
	telegramId: '1',
	lastAsk: null,
	flow: null,
	lastPage: null,
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
		{ type: EffectType.EDIT, page: makePage(actionId) },
	)
}

const enterWithoutAction = (session: SessionData, page: PageContent) => {
	recordPage(
		session,
		{ actionId: 'unused', payload: undefined },
		{ type: EffectType.EDIT, page, history: { kind: 'page' } },
	)
}

const enterAsRoot = (session: SessionData, actionId: string) => {
	recordPage(
		session,
		{ actionId, payload: undefined },
		{
			type: EffectType.EDIT,
			page: makePage(actionId),
			history: { clears: true },
		},
	)
}

/**
 * Goes back the way the executor does: read the target, then record the
 * rendered page under the back action.
 */
const goBack = (session: SessionData): HistoryEntry | null => {
	const target = previousEntry(session)

	if (target === null) return null

	const page = target.kind === 'page' ? target.page : makePage('rerun')

	recordPage(
		session,
		{ actionId: BACK_ACTION_ID, payload: undefined },
		{ type: EffectType.EDIT, page },
	)

	return target
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
			{ type: EffectType.EDIT, page },
		)

		expect(session.lastPage).toBe(page)
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
				type: EffectType.EDIT,
				page,
				history: { kind: 'page', clears: true },
			},
		)

		expect(session.history).toEqual([{ kind: 'page', page }])
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
