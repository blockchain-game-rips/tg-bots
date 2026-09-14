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
	Workspace,
} from '@rips/grammy-kit'
import { InlineKeyboard, InputFile } from 'grammy'

const MESSAGE_ID = 7

const makeWorkspace = (): Workspace => ({
	messageId: MESSAGE_ID,
	lastInteraction: 0,
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

const currentEntry = (workspace: Workspace): HistoryEntry | null =>
	workspace.history[workspace.history.length - 1] ?? null

const enter = (workspace: Workspace, actionId: string, payload?: string) => {
	recordPage(
		workspace,
		{ actionId, payload },
		{ type: EffectType.NAVIGATE, page: makePage(actionId) },
	)
}

const enterWithoutAction = (workspace: Workspace, page: PageContent) => {
	recordPage(
		workspace,
		{ actionId: 'unused', payload: undefined },
		{ type: EffectType.NAVIGATE, page, history: { kind: 'page' } },
	)
}

const enterAsRoot = (workspace: Workspace, actionId: string) => {
	recordPage(
		workspace,
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
const goBack = (workspace: Workspace): HistoryEntry | null => {
	const navigation = resolveNavigation(workspace, {
		actionId: BACK_ACTION_ID,
		payload: undefined,
	})

	if (navigation.kind !== 'back') return null

	const entry = navigation.to

	const page = entry.kind === 'page' ? entry.page : makePage('rerun')

	recordPage(
		workspace,
		{ actionId: BACK_ACTION_ID, payload: undefined },
		{ type: EffectType.NAVIGATE, page },
	)

	return entry
}

describe('recordPage', () => {
	it('puts the page on screen at the top of the history', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')

		expect(currentEntry(workspace)).toEqual(actionEntry('home'))
	})

	it('keeps the rendered page for error messages', () => {
		const workspace = makeWorkspace()
		const page = makePage('home')

		recordPage(
			workspace,
			{ actionId: 'home', payload: undefined },
			{ type: EffectType.NAVIGATE, page },
		)

		expect(workspace.lastNavigatedPage).toBe(page)
	})

	it('keeps the pages behind the one on screen, in the order visited', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')
		enter(workspace, 'preset')

		expect(workspace.history).toEqual([
			actionEntry('home'),
			actionEntry('preset'),
		])
	})

	it('keeps the payload, so two views of the same page stay distinct', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'rip', '1')
		enter(workspace, 'rip', '2')

		expect(workspace.history).toEqual([
			actionEntry('rip', '1'),
			actionEntry('rip', '2'),
		])
	})

	it('replaces the page on screen when it refreshes itself', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')
		enter(workspace, 'wallet')
		enter(workspace, 'wallet')
		enter(workspace, 'wallet')

		expect(workspace.history).toEqual([
			actionEntry('home'),
			actionEntry('wallet'),
		])
	})

	it('keeps both visits of a genuine there-and-back-again', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'a')
		enter(workspace, 'b')
		enter(workspace, 'a')

		expect(workspace.history).toEqual([
			actionEntry('a'),
			actionEntry('b'),
			actionEntry('a'),
		])
	})

	it('drops the oldest page once the history is full', () => {
		const workspace = makeWorkspace()

		const visits = MAX_HISTORY_DEPTH + 5

		for (let index = 0; index < visits; index++) {
			enter(workspace, `page-${String(index)}`)
		}

		expect(workspace.history).toHaveLength(MAX_HISTORY_DEPTH)
		expect(workspace.history[0]).toEqual(actionEntry('page-5'))
	})
})

describe('recordPage with a page entry', () => {
	it('keeps the render, since no action would reproduce it', () => {
		const workspace = makeWorkspace()
		const page = makePage('you won')

		enter(workspace, 'reveal')
		enterWithoutAction(workspace, page)

		expect(currentEntry(workspace)).toEqual({ kind: 'page', page })
	})

	it('keeps the pages behind it reachable', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'rip', '7')
		enter(workspace, 'reveal')
		enterWithoutAction(workspace, makePage('you won'))

		goBack(workspace)

		expect(currentEntry(workspace)).toEqual(actionEntry('reveal'))
	})

	it('ignores a photo page rather than holding its image buffer', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'reveal')
		enterWithoutAction(workspace, {
			...makePage('you won'),
			media: { kind: 'photo', file: new InputFile(Buffer.from('image')) },
		})

		expect(currentEntry(workspace)).toEqual(actionEntry('reveal'))
	})

	it('ignores a document page too, since its buffer is just as heavy', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'reveal')
		enterWithoutAction(workspace, {
			...makePage('your report'),
			media: {
				kind: 'document',
				file: new InputFile(Buffer.from('report')),
			},
		})

		expect(currentEntry(workspace)).toEqual(actionEntry('reveal'))
	})

	it('stacks pages that claim no trail slot, since nothing marks them alike', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterWithoutAction(workspace, makePage('first'))
		enterWithoutAction(workspace, makePage('second'))

		expect(workspace.history).toHaveLength(3)
	})
})

describe('recordPage with a trail slot', () => {
	const SLOT = 'reveal-result'

	const enterSlot = (workspace: Workspace, text: string, slot = SLOT) => {
		enterWithoutAction(workspace, { ...makePage(text), trailSlot: slot })
	}

	it('supersedes the page holding the slot, keeping only the latest', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'first card')
		enterSlot(workspace, 'second card')
		enterSlot(workspace, 'third card')

		expect(workspace.history).toEqual([
			actionEntry('hub'),
			{
				kind: 'page',
				page: { ...makePage('third card'), trailSlot: SLOT },
			},
		])
	})

	it('leaves for the page behind it, however many times it refreshed', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'first card')
		enterSlot(workspace, 'second card')
		enterSlot(workspace, 'third card')

		expect(goBack(workspace)).toEqual(actionEntry('hub'))
	})

	it('lets a different page claim the same slot, so either supersedes the other', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'single reveal')
		enterSlot(workspace, 'batch reveal')

		expect(goBack(workspace)).toEqual(actionEntry('hub'))
	})

	it('stacks against a page holding a different slot', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'reveal')
		enterSlot(workspace, 'summary', 'reveal-summary')

		expect(workspace.history).toHaveLength(3)
	})

	it('keeps a page opened on top of it, so back returns to the latest', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'first card')
		enterSlot(workspace, 'second card')
		enter(workspace, 'collection')

		expect(goBack(workspace)).toEqual({
			kind: 'page',
			page: { ...makePage('second card'), trailSlot: SLOT },
		})
	})

	it('stacks a revisit made after leaving, since the trail moved on', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'hub')
		enterSlot(workspace, 'first card')
		enter(workspace, 'collection')
		enterSlot(workspace, 'second card')

		expect(workspace.history).toHaveLength(4)
	})
})

describe('recordPage with a sensitive page', () => {
	const enterSensitive = (workspace: Workspace, actionId: string) => {
		recordPage(
			workspace,
			{ actionId, payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: { ...makePage(actionId), sensitive: true },
			},
		)
	}

	it('keeps no render of it, so the secret never reaches workspace storage', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'export-key-warning')
		enterSensitive(workspace, 'export-key')

		expect(workspace.lastNavigatedPage).toBeNull()
	})

	it('stays off the trail, so no back press can return to the secret', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'wallet')
		enter(workspace, 'export-key-warning')
		enterSensitive(workspace, 'export-key')

		expect(workspace.history).toEqual([
			actionEntry('wallet'),
			actionEntry('export-key-warning'),
		])
	})

	it('leaves past the page that warned about it', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'wallet')
		enter(workspace, 'export-key-warning')
		enterSensitive(workspace, 'export-key')

		expect(goBack(workspace)).toEqual(actionEntry('wallet'))
	})
})

describe('recordPage with replayWith', () => {
	const SECRET = '0xprivatekey'

	const REPLAY_ACTION = 'home' as ActionId

	const CURRENCY = '7'

	const submitSecret = (workspace: Workspace, clears = false) => {
		recordPage(
			workspace,
			{ actionId: 'import-key', payload: SECRET },
			{
				type: EffectType.NAVIGATE,
				page: makePage('home'),
				history: { clears, replayWith: REPLAY_ACTION },
			},
		)
	}

	it('records the named action instead of the one that ran', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'checkout')
		recordPage(
			workspace,
			{ actionId: 'buy-entries', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: makePage('bought'),
				history: { replayWith: REPLAY_ACTION },
			},
		)

		expect(currentEntry(workspace)).toEqual(actionEntry('home'))
	})

	it('goes back to it rather than repeating the action that ran', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'checkout')
		recordPage(
			workspace,
			{ actionId: 'buy-entries', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page: makePage('bought'),
				history: { replayWith: REPLAY_ACTION },
			},
		)
		enter(workspace, 'collection')

		expect(goBack(workspace)).toEqual(actionEntry('home'))
	})

	it('keeps the typed secret out of the trail', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'welcome')
		submitSecret(workspace)

		expect(JSON.stringify(workspace.history)).not.toContain(SECRET)
	})

	it('keeps it out even when the page it lands on starts a fresh trail', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'welcome')
		submitSecret(workspace, true)

		expect(JSON.stringify(workspace.history)).not.toContain(SECRET)
	})

	it('still shows the page it landed on, since only the payload is secret', () => {
		const workspace = makeWorkspace()

		submitSecret(workspace)

		expect(workspace.lastNavigatedPage?.message.text).toBe('home')
	})

	it('carries a payload the replayed action needs to render', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'choose-currency')
		recordPage(
			workspace,
			{ actionId: 'deposit-qr', payload: CURRENCY },
			{
				type: EffectType.NAVIGATE,
				page: makePage('deposit'),
				history: {
					replayWith: `deposit${COMMAND_SEPARATOR}${CURRENCY}`,
				},
			},
		)

		expect(currentEntry(workspace)).toEqual(
			actionEntry('deposit', CURRENCY),
		)
	})

	it('collapses states of one page so back leaves it', () => {
		const workspace = makeWorkspace()

		const showState = (actionId: string) => {
			recordPage(
				workspace,
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

		enter(workspace, 'choose-currency')
		showState('deposit')
		showState('deposit-qr')
		showState('deposit')
		showState('deposit-qr')

		expect(goBack(workspace)).toEqual(actionEntry('choose-currency'))
	})
})

describe('recordPage clearing the history', () => {
	it('leaves the page as the only one, so there is nowhere to go back to', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'a')
		enter(workspace, 'b')
		enterAsRoot(workspace, 'home')

		expect(workspace.history).toEqual([actionEntry('home')])
		expect(goBack(workspace)).toBeNull()
	})

	it('starts a fresh trail that goes back to it', () => {
		const workspace = makeWorkspace()

		enterAsRoot(workspace, 'home')
		enter(workspace, 'wallet')

		expect(goBack(workspace)).toEqual(actionEntry('home'))
	})

	it('seeds an empty history, so the first page needs no special casing', () => {
		const workspace = makeWorkspace()

		enterAsRoot(workspace, 'home')

		expect(workspace.history).toEqual([actionEntry('home')])
	})

	it('keeps the render when the page is also the start of the trail', () => {
		const workspace = makeWorkspace()
		const page = makePage('welcome')

		enter(workspace, 'a')
		recordPage(
			workspace,
			{ actionId: 'welcome', payload: undefined },
			{
				type: EffectType.NAVIGATE,
				page,
				history: { kind: 'page', clears: true },
			},
		)

		expect(workspace.history).toEqual([{ kind: 'page', page }])
	})
})

describe('resolveNavigation', () => {
	const back = { actionId: BACK_ACTION_ID, payload: undefined }

	it('sends a normal action forward to its own handler', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')

		const action = { actionId: 'wallet', payload: undefined }

		expect(resolveNavigation(workspace, action)).toEqual({
			kind: 'forward',
			action,
		})
	})

	it('reports at-root when there is nowhere to go back to', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')

		expect(resolveNavigation(workspace, back)).toEqual({ kind: 'at-root' })
	})

	it('points back at the page behind the one on screen', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')
		enter(workspace, 'wallet')

		expect(resolveNavigation(workspace, back)).toEqual({
			kind: 'back',
			to: actionEntry('home'),
		})
	})
})

describe('going back', () => {
	it('returns null when the first page is the only one', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')

		expect(goBack(workspace)).toBeNull()
	})

	it('returns null when nothing has been entered yet', () => {
		expect(goBack(makeWorkspace())).toBeNull()
	})

	it('returns the page behind the one on screen', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')
		enter(workspace, 'preset')

		expect(goBack(workspace)).toEqual(actionEntry('home'))
	})

	it('unwinds one page per press, in reverse order of visiting', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'a')
		enter(workspace, 'b')
		enter(workspace, 'e')

		expect(goBack(workspace)).toEqual(actionEntry('b'))
		expect(goBack(workspace)).toEqual(actionEntry('a'))
		expect(goBack(workspace)).toBeNull()
	})

	it('follows the path actually taken when a page has several entrances', () => {
		const viaHome = makeWorkspace()

		enter(viaHome, 'a')
		enter(viaHome, 'b')
		enter(viaHome, 'e')

		const viaWallet = makeWorkspace()

		enter(viaWallet, 'd')
		enter(viaWallet, 'b')
		enter(viaWallet, 'e')

		expect(goBack(viaHome)).toEqual(actionEntry('b'))
		expect(goBack(viaHome)).toEqual(actionEntry('a'))

		expect(goBack(viaWallet)).toEqual(actionEntry('b'))
		expect(goBack(viaWallet)).toEqual(actionEntry('d'))
	})

	it('leaves the page it returns to on screen, so leaving again moves on', () => {
		const workspace = makeWorkspace()

		enter(workspace, 'a')
		enter(workspace, 'b')
		enter(workspace, 'c')

		goBack(workspace)

		expect(currentEntry(workspace)).toEqual(actionEntry('b'))

		enter(workspace, 'c')

		expect(workspace.history).toEqual([
			actionEntry('a'),
			actionEntry('b'),
			actionEntry('c'),
		])
	})
})
