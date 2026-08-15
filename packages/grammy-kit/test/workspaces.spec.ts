import {
	ActionId,
	claimMessage,
	findWorkspaceByPrompt,
	initialSession,
	MAX_WORKSPACES,
	openWorkspace,
	resolveWorkspace,
	SessionData,
} from '@rips/grammy-kit'

const SUBMIT_ACTION = 'submit' as ActionId<unknown>

const fillPool = (session: SessionData): number[] =>
	Array.from({ length: MAX_WORKSPACES }, (_unused, index) => {
		const messageId = index + 1
		resolveWorkspace(session, messageId)

		return messageId
	})

const messageIdsOf = (session: SessionData): number[] =>
	session.workspaces.map((workspace) => workspace.messageId)

const awaitReplyAt = (
	session: SessionData,
	messageId: number,
	promptMessageId: number,
) => {
	resolveWorkspace(session, messageId).lastAsk = {
		onSubmit: SUBMIT_ACTION,
		message: null,
		promptMessageId,
	}
}

describe('resolving the workspace behind a message', () => {
	it('keeps returning the one a message already has', () => {
		const session = initialSession()

		const first = resolveWorkspace(session, 1)
		first.history.push({
			kind: 'action',
			action: { actionId: 'home', payload: undefined },
		})

		expect(resolveWorkspace(session, 1)).toBe(first)
	})

	it('gives each message its own, so drafts do not bleed together', () => {
		const session = initialSession()

		resolveWorkspace(session, 1).flow = {
			flowType: 'withdraw',
			step: 'at-amount',
			data: null,
		}

		expect(resolveWorkspace(session, 2).flow).toBeNull()
	})

	it('starts an empty one for a message the bot no longer remembers', () => {
		const session = initialSession()

		const workspace = resolveWorkspace(session, 999)

		expect(workspace.flow).toBeNull()
		expect(workspace.history).toEqual([])
	})
})

describe('making room once the chat is full', () => {
	it('holds every workspace up to the limit', () => {
		const session = initialSession()

		fillPool(session)

		expect(session.workspaces).toHaveLength(MAX_WORKSPACES)
	})

	it('drops the least recently used to admit the next one', () => {
		const session = initialSession()

		fillPool(session)
		resolveWorkspace(session, 1)

		openWorkspace(session)

		expect(messageIdsOf(session)).not.toContain(2)
		expect(messageIdsOf(session)).toContain(1)
	})

	it('never grows past the limit, however many are opened', () => {
		const session = initialSession()

		const extras = 3

		for (let index = 0; index < MAX_WORKSPACES + extras; index++) {
			openWorkspace(session)
		}

		expect(session.workspaces).toHaveLength(MAX_WORKSPACES)
	})

	it('lets a press on a forgotten message evict a live one', () => {
		const session = initialSession()

		fillPool(session)

		resolveWorkspace(session, 500)

		expect(messageIdsOf(session)).toContain(500)
		expect(session.workspaces).toHaveLength(MAX_WORKSPACES)
	})
})

describe('routing a typed reply', () => {
	it('finds the workspace awaiting that prompt', () => {
		const session = initialSession()
		const promptMessageId = 42

		awaitReplyAt(session, 1, promptMessageId)
		awaitReplyAt(session, 2, 43)

		expect(findWorkspaceByPrompt(session, promptMessageId)?.messageId).toBe(
			1,
		)
	})

	it('lets two workspaces await input at the same time', () => {
		const session = initialSession()

		awaitReplyAt(session, 1, 42)
		awaitReplyAt(session, 2, 43)

		expect(findWorkspaceByPrompt(session, 42)?.messageId).toBe(1)
		expect(findWorkspaceByPrompt(session, 43)?.messageId).toBe(2)
	})

	it('finds nothing for a prompt whose workspace is gone', () => {
		const session = initialSession()

		expect(findWorkspaceByPrompt(session, 42)).toBeNull()
	})
})

describe('opening a workspace before its message exists', () => {
	it('stays unreachable until it claims the message it landed on', () => {
		const session = initialSession()
		const messageId = 7

		const opened = openWorkspace(session)

		expect(resolveWorkspace(session, messageId)).not.toBe(opened)
	})

	it('answers to the message once claimed', () => {
		const session = initialSession()
		const messageId = 7

		const opened = openWorkspace(session)
		claimMessage(opened, messageId)

		expect(resolveWorkspace(session, messageId)).toBe(opened)
	})
})
