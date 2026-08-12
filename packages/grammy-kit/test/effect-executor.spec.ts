import { FormattedString } from '@grammyjs/parse-mode'
import {
	ActionId,
	AnyHandlerResult,
	BACK_ACTION_ID,
	BoundAction,
	Effect,
	EffectType,
	executeEffectOrDisplayError,
	Message,
	PageContent,
	recordPage,
	SessionData,
} from '@rips/grammy-kit'
import { Api, InlineKeyboard } from 'grammy'

const CHAT_ID = 100
const MESSAGE_ID = 7

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

const message: Message = {
	messageId: MESSAGE_ID,
	hasPhoto: false,
}

interface FakeApi {
	api: Api
	editedTexts: string[]
	sentPrompts: string[]
	deleted: number[][]
	failNextEdit: () => void
}

const makeApi = (): FakeApi => {
	const editedTexts: string[] = []
	const sentPrompts: string[] = []
	const deleted: number[][] = []

	let nextMessageId = MESSAGE_ID + 1
	let editFails = false

	const api = {
		editMessageText: (
			_chatId: number,
			_messageId: number,
			text: string,
		) => {
			if (editFails) {
				editFails = false

				return Promise.reject(new Error('edit failed'))
			}

			editedTexts.push(text)

			return Promise.resolve({ message_id: MESSAGE_ID })
		},

		sendMessage: (_chatId: number, text: string, other?: unknown) => {
			const isPrompt =
				other !== null &&
				typeof other === 'object' &&
				'reply_markup' in other &&
				other.reply_markup !== null &&
				typeof other.reply_markup === 'object' &&
				'force_reply' in other.reply_markup

			if (isPrompt) sentPrompts.push(text)

			return Promise.resolve({ message_id: nextMessageId++ })
		},

		deleteMessages: (_chatId: number, messageIds: number[]) => {
			deleted.push(messageIds)

			return Promise.resolve(true)
		},
	}

	return {
		api: api as unknown as Api,
		editedTexts,
		sentPrompts,
		deleted,
		failNextEdit: () => {
			editFails = true
		},
	}
}

const holding = (effect: Effect): AnyHandlerResult =>
	effect.type === EffectType.LOADING
		? { effect }
		: { flow: { kind: 'hold' as const }, effect }

const boundAction = (effect: Effect): BoundAction => ({
	decode: (raw) => raw,
	handler: () => holding(effect),
})

const enter = (session: SessionData, actionId: string) => {
	recordPage(
		session,
		{ actionId, payload: undefined },
		{ type: EffectType.NAVIGATE, page: makePage(actionId) },
	)
}

const run = (
	fake: FakeApi,
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	actionId = 'w',
	messagesToDelete: number[] = [],
) =>
	executeEffectOrDisplayError(
		fake.api,
		CHAT_ID,
		message,
		session,
		actions,
		{ actionId, payload: undefined },
		makePage('fallback'),
		messagesToDelete,
	)

describe('executing a render', () => {
	it('sends the page and records it as the page on screen', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(
			fake,
			session,
			{
				w: boundAction({
					type: EffectType.NAVIGATE,
					page: makePage('wallet'),
				}),
			},
			'w',
		)

		expect(fake.editedTexts).toEqual(['wallet'])
		expect(session.lastNavigatedPage?.message.text).toBe('wallet')
		expect(session.history).toEqual([
			{ kind: 'action', action: { actionId: 'w', payload: undefined } },
		])
	})
})

describe('executing an ask', () => {
	it('sends the prompt and remembers where the answer goes', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(
			fake,
			session,
			{
				a: boundAction({
					type: EffectType.ASK,
					prompt: {
						message: new FormattedString('amount?', []),
						placeholder: '0.1',
					},
					onSubmit: 'submit' as never,
				}),
			},
			'a',
		)

		expect(fake.sentPrompts).toEqual(['amount?'])
		expect(session.lastAsk).toMatchObject({ onSubmit: 'submit' })
	})

	it('leaves the page on screen untouched, so it is not a step in the trail', async () => {
		const fake = makeApi()
		const session = makeSession()

		enter(session, 'wallet')

		await run(
			fake,
			session,
			{
				a: boundAction({
					type: EffectType.ASK,
					prompt: {
						message: new FormattedString('amount?', []),
						placeholder: '0.1',
					},
					onSubmit: 'submit' as never,
				}),
			},
			'a',
		)

		expect(session.history).toEqual([
			{
				kind: 'action',
				action: { actionId: 'wallet', payload: undefined },
			},
		])
	})
})

describe('executing loading', () => {
	const loadingThen = (frames: string[], finalPage: string): Effect => {
		const build = (index: number): Effect => {
			if (index === frames.length) {
				return { type: EffectType.NAVIGATE, page: makePage(finalPage) }
			}

			return {
				type: EffectType.LOADING,
				message: new FormattedString(frames[index] ?? '', []),
				next: () => Promise.resolve(holding(build(index + 1))),
			}
		}

		return build(0)
	}

	it('shows the loading screen, then the real page', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(
			fake,
			session,
			{ l: boundAction(loadingThen(['loading'], 'done')) },
			'l',
		)

		expect(fake.editedTexts).toEqual(['loading', 'done'])
	})

	it('records only the real page, never the loading screen', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(
			fake,
			session,
			{ l: boundAction(loadingThen(['loading'], 'done')) },
			'l',
		)

		expect(session.lastNavigatedPage?.message.text).toBe('done')
		expect(session.history).toEqual([
			{ kind: 'action', action: { actionId: 'l', payload: undefined } },
		])
	})

	it('walks a chain of loading frames without recording any of them', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(
			fake,
			session,
			{ l: boundAction(loadingThen(['one', 'two', 'three'], 'done')) },
			'l',
		)

		expect(fake.editedTexts).toEqual(['one', 'two', 'three', 'done'])
		expect(session.history).toHaveLength(1)
		expect(session.lastNavigatedPage?.message.text).toBe('done')
	})

	it('never leaves a loading frame as the page an error would render over', async () => {
		const fake = makeApi()
		const session = makeSession()
		const seenWhileLoading: (string | undefined)[] = []

		enter(session, 'wallet')

		await run(
			fake,
			session,
			{
				l: boundAction({
					type: EffectType.LOADING,
					message: new FormattedString('loading', []),
					next: () => {
						seenWhileLoading.push(
							session.lastNavigatedPage?.message.text,
						)

						return Promise.resolve({
							flow: { kind: 'hold' },
							effect: {
								type: EffectType.NAVIGATE,
								page: makePage('done'),
							},
						})
					},
				}),
			},
			'l',
		)

		expect(seenWhileLoading).toEqual(['wallet'])
	})

	it('leaves the flow untouched until the chain reaches its last page', async () => {
		const fake = makeApi()
		const session = makeSession()
		const seenWhileLoading: unknown[] = []

		const settled = {
			kind: 'set' as const,
			flow: { flowType: 'topup', step: 'done', data: {} },
		}

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => ({
					effect: {
						type: EffectType.LOADING,
						message: new FormattedString('step one', []),
						next: () => {
							seenWhileLoading.push(session.flow)

							return Promise.resolve({
								effect: {
									type: EffectType.LOADING,
									message: new FormattedString(
										'step two',
										[],
									),
									next: () => {
										seenWhileLoading.push(session.flow)

										return Promise.resolve({
											flow: settled,
											effect: {
												type: EffectType.NAVIGATE,
												page: makePage('done'),
											},
										})
									},
								},
							})
						},
					},
				}),
			},
		})

		expect(seenWhileLoading).toEqual([null, null])
		expect(session.flow).toEqual(settled.flow)
	})

	it('shows the error over the page from before loading started', async () => {
		const fake = makeApi()
		const session = makeSession()

		enter(session, 'wallet')

		await run(
			fake,
			session,
			{
				l: boundAction({
					type: EffectType.LOADING,
					message: new FormattedString('loading', []),
					next: () => Promise.reject(new Error('boom')),
				}),
			},
			'l',
		)

		await Promise.resolve()

		const lastEdit = fake.editedTexts[fake.editedTexts.length - 1] ?? ''

		expect(lastEdit).toContain('wallet')
	})
})

describe('going back', () => {
	it('re-runs the action behind the page on screen and pops the trail', async () => {
		const fake = makeApi()
		const session = makeSession()

		const actions = {
			home: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('home'),
			}),
			wallet: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('wallet'),
			}),
		}

		await run(fake, session, actions, 'home')
		await run(fake, session, actions, 'wallet')
		await run(fake, session, actions, BACK_ACTION_ID)

		expect(fake.editedTexts).toEqual(['home', 'wallet', 'home'])
		expect(session.history).toEqual([
			{
				kind: 'action',
				action: { actionId: 'home', payload: undefined },
			},
		])
	})

	it('tells the user there is no history at the root of the trail', async () => {
		const fake = makeApi()
		const session = makeSession()

		const actions = {
			home: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('home'),
			}),
		}

		await run(fake, session, actions, 'home')
		await run(fake, session, actions, BACK_ACTION_ID)

		await Promise.resolve()

		const lastEdit = fake.editedTexts[fake.editedTexts.length - 1] ?? ''

		expect(lastEdit).toContain('home')
		expect(lastEdit).toContain('No history')
	})

	it('tells the user their menu is stale when the action no longer exists', async () => {
		const fake = makeApi()
		const session = makeSession()

		const actions = {
			home: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('home'),
			}),
		}

		await run(fake, session, actions, 'home')
		await run(fake, session, actions, 'removed')

		await Promise.resolve()

		const lastEdit = fake.editedTexts[fake.editedTexts.length - 1] ?? ''

		expect(lastEdit).toContain('out of date')
	})

	it('replays a stored page instead of re-running an action', async () => {
		const fake = makeApi()
		const session = makeSession()

		const actions = {
			receipt: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('receipt'),
				history: { kind: 'page' },
			}),
			next: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('next'),
			}),
		}

		await run(fake, session, actions, 'receipt')
		await run(fake, session, actions, 'next')
		await run(fake, session, actions, BACK_ACTION_ID)

		expect(fake.editedTexts).toEqual(['receipt', 'next', 'receipt'])
	})
})

describe('committing the session', () => {
	const topup = {
		kind: 'set' as const,
		flow: { flowType: 'topup', step: 'amount', data: {} },
	}

	it('applies the flow the handler asked for once the page is on screen', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => ({
					flow: topup,
					effect: {
						type: EffectType.NAVIGATE,
						page: makePage('amount'),
					},
				}),
			},
		})

		expect(session.flow).toEqual(topup.flow)
	})

	it('applies the flow the handler asked for once the prompt is sent', async () => {
		const fake = makeApi()
		const session = makeSession()

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => ({
					flow: topup,
					effect: {
						type: EffectType.ASK,
						prompt: {
							message: new FormattedString('amount?', []),
							placeholder: '0.1',
						},
						onSubmit: 'submit' as ActionId<unknown>,
					},
				}),
			},
		})

		expect(session.flow).toEqual(topup.flow)
	})

	it('leaves the flow alone when the page never reaches the user', async () => {
		const fake = makeApi()
		const session = makeSession()

		fake.failNextEdit()

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => ({
					flow: topup,
					effect: {
						type: EffectType.NAVIGATE,
						page: makePage('amount'),
					},
				}),
			},
		})

		expect(session.flow).toBeNull()
	})

	it('drops a pending ask when the action fails, since its prompt is gone', async () => {
		const fake = makeApi()
		const session = makeSession()

		session.lastAsk = {
			onSubmit: 'submit' as ActionId<unknown>,
			messageToEdit: message,
			promptMessageId: 9,
		}

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => {
					throw new Error('boom')
				},
			},
		})

		expect(session.lastAsk).toBeNull()
	})

	it('leaves the trail and the flow alone when the action fails', async () => {
		const fake = makeApi()
		const session = makeSession()

		enter(session, 'wallet')

		const before = {
			history: [...session.history],
			page: session.lastNavigatedPage,
		}

		await run(fake, session, {
			w: {
				decode: (raw: string) => raw,
				handler: () => {
					throw new Error('boom')
				},
			},
		})

		expect(session.flow).toBeNull()
		expect(session.history).toEqual(before.history)
		expect(session.lastNavigatedPage).toBe(before.page)
	})

	it('clears a pending ask once the next page renders', async () => {
		const fake = makeApi()
		const session = makeSession()

		session.lastAsk = {
			onSubmit: 'submit' as ActionId<unknown>,
			messageToEdit: message,
			promptMessageId: 9,
		}

		await run(fake, session, {
			w: boundAction({
				type: EffectType.NAVIGATE,
				page: makePage('wallet'),
			}),
		})

		expect(session.lastAsk).toBeNull()
	})
})

describe('cleaning up', () => {
	it('deletes the messages it was told to, even when the action fails', async () => {
		const fake = makeApi()
		const session = makeSession()
		const promptMessageId = 55

		await run(
			fake,
			session,
			{
				bad: {
					decode: (raw: string) => raw,
					handler: () => {
						throw new Error('boom')
					},
				},
			},
			'bad',
			[promptMessageId],
		)

		await Promise.resolve()

		expect(fake.deleted).toEqual([[promptMessageId]])
	})
})
