import { FormattedString } from '@grammyjs/parse-mode'
import {
	ActionId,
	BACK_ACTION_ID,
	BoundAction,
	Effect,
	EffectType,
	ErrorToRender,
	PageContent,
	resolveActionEffect,
	recordPage,
	Workspace,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'

const TELEGRAM_ID = 1
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

const boundAction = (effect: Effect | (() => Effect)): BoundAction => ({
	decode: (raw) => raw,
	handler: () => {
		const resolved = typeof effect === 'function' ? effect() : effect

		return resolved.type === EffectType.LOADING
			? { effect: resolved }
			: { flow: { kind: 'hold' as const }, effect: resolved }
	},
})

const enter = (workspace: Workspace, actionId: string) => {
	recordPage(
		workspace,
		{ actionId, payload: undefined },
		{ type: EffectType.NAVIGATE, page: makePage(actionId) },
	)
}

const back = { actionId: BACK_ACTION_ID, payload: undefined }

describe('resolveActionEffect', () => {
	it('returns the render the action handler asked for', async () => {
		const workspace = makeWorkspace()
		const page = makePage('wallet')

		const { effect } = await resolveActionEffect(
			workspace,
			TELEGRAM_ID,
			{ w: boundAction({ type: EffectType.NAVIGATE, page }) },
			{ actionId: 'w', payload: undefined },
		)

		expect(effect).toMatchObject({ type: EffectType.NAVIGATE, page })
	})

	it('returns an ask without sending anything', async () => {
		const workspace = makeWorkspace()
		const prompt = {
			message: new FormattedString('amount?', []),
			placeholder: '0.1',
		}
		const onSubmit = 'submit' as ActionId<unknown>

		const { effect } = await resolveActionEffect(
			workspace,
			TELEGRAM_ID,
			{ a: boundAction({ type: EffectType.ASK, prompt, onSubmit }) },
			{ actionId: 'a', payload: undefined },
		)

		expect(effect).toEqual({ type: EffectType.ASK, prompt, onSubmit })
		expect(workspace.lastAsk).toBeNull()
	})

	it('tells the user their menu is stale when the action is gone', async () => {
		await expect(
			resolveActionEffect(
				makeWorkspace(),
				TELEGRAM_ID,
				{},
				{ actionId: 'nope', payload: undefined },
			),
		).rejects.toBeInstanceOf(ErrorToRender)
	})

	it('tells the user there is no history when back hits the root', async () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')

		await expect(
			resolveActionEffect(workspace, TELEGRAM_ID, {}, back),
		).rejects.toBeInstanceOf(ErrorToRender)
	})

	it('decodes the payload before handing it to the handler', async () => {
		const seen: unknown[] = []

		await resolveActionEffect(
			makeWorkspace(),
			TELEGRAM_ID,
			{
				w: {
					decode: (raw) => Number(raw),
					handler: (_actionContext, payload) => {
						seen.push(payload)

						return {
							flow: { kind: 'hold' as const },
							effect: {
								type: EffectType.NAVIGATE,
								page: makePage('x'),
							},
						}
					},
				},
			},
			{ actionId: 'w', payload: '42' },
		)

		expect(seen).toEqual([42])
	})

	it('re-runs the handler of the action behind the current page on back', async () => {
		const workspace = makeWorkspace()

		enter(workspace, 'home')
		enter(workspace, 'wallet')

		const page = makePage('home again')

		const { effect } = await resolveActionEffect(
			workspace,
			TELEGRAM_ID,
			{ home: boundAction({ type: EffectType.NAVIGATE, page }) },
			back,
		)

		expect(effect).toMatchObject({ type: EffectType.NAVIGATE, page })
	})

	it('writes nothing to the workspace while resolving a render', async () => {
		const workspace = makeWorkspace()
		const before = structuredClone({
			lastNavigatedPage: workspace.lastNavigatedPage,
			history: workspace.history,
		})

		await resolveActionEffect(
			workspace,
			TELEGRAM_ID,
			{
				w: boundAction({
					type: EffectType.NAVIGATE,
					page: makePage('w'),
				}),
			},
			{ actionId: 'w', payload: undefined },
		)

		expect(workspace.lastNavigatedPage).toEqual(before.lastNavigatedPage)
		expect(workspace.history).toEqual(before.history)
	})

	it('returns loading without resolving what comes after it', async () => {
		let nextRan = false

		const { effect } = await resolveActionEffect(
			makeWorkspace(),
			TELEGRAM_ID,
			{
				l: boundAction({
					type: EffectType.LOADING,
					message: new FormattedString('loading', []),
					next: () => {
						nextRan = true

						return Promise.resolve({
							flow: { kind: 'hold' as const },
							effect: {
								type: EffectType.NAVIGATE,
								page: makePage('done'),
							},
						})
					},
				}),
			},
			{ actionId: 'l', payload: undefined },
		)

		expect(effect.type).toBe(EffectType.LOADING)
		expect(nextRan).toBe(false)
	})

	it('resolves the page behind loading when asked for it', async () => {
		const page = makePage('done')

		const { effect } = await resolveActionEffect(
			makeWorkspace(),
			TELEGRAM_ID,
			{
				l: boundAction({
					type: EffectType.LOADING,
					message: new FormattedString('loading', []),
					next: () =>
						Promise.resolve({
							flow: { kind: 'hold' as const },
							effect: { type: EffectType.NAVIGATE, page },
						}),
				}),
			},
			{ actionId: 'l', payload: undefined },
		)

		if (effect.type !== EffectType.LOADING) {
			throw new Error('expected loading')
		}

		expect(await effect.next()).toMatchObject({
			effect: { type: EffectType.NAVIGATE, page },
		})
	})

	it('returns the flow the handler asked for without applying it', async () => {
		const workspace = makeWorkspace()
		const flow = {
			kind: 'set' as const,
			flow: { flowType: 'topup', step: 'amount', data: {} },
		}

		const result = await resolveActionEffect(
			workspace,
			TELEGRAM_ID,
			{
				w: {
					decode: (raw) => raw,
					handler: () => ({
						flow,
						effect: {
							type: EffectType.NAVIGATE,
							page: makePage('w'),
						},
					}),
				},
			},
			{ actionId: 'w', payload: undefined },
		)

		expect(result.flow).toEqual(flow)
		expect(workspace.flow).toBeNull()
	})
})
