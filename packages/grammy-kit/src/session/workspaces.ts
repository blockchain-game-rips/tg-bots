import { FlowBase } from './session-utils'
import { SessionData, Workspace } from '../types'

/**
 * How many messages of one chat stay interactive at once. Reached by opening
 * that many with /start, since every other press edits a message that already
 * has a workspace.
 */
export const MAX_WORKSPACES = 5

/**
 * Orders interactions rather than dating them: several can land in the same
 * millisecond, which leaves a clock unable to say which workspace is coldest.
 */
let interactionCounter = 0

function touch(workspace: Workspace): void {
	interactionCounter += 1
	workspace.lastInteraction = interactionCounter
}

function createWorkspace<F extends FlowBase | null>(
	messageId: number,
): Workspace<F> {
	interactionCounter += 1

	return {
		messageId,
		lastInteraction: interactionCounter,
		lastAsk: null,
		flow: null as F,
		lastNavigatedPage: null,
		history: [],
	}
}

export function initialSession<F extends FlowBase | null>(): SessionData<F> {
	return { workspaces: [] }
}

/**
 * The id a workspace holds between /start opening it and its first page being
 * sent. No Telegram message carries it, so nothing resolves to this workspace
 * until it claims the message it landed on.
 */
const UNSENT_MESSAGE_ID = -1

export function openWorkspace<F extends FlowBase | null>(
	session: SessionData<F>,
): Workspace<F> {
	const workspace = createWorkspace<F>(UNSENT_MESSAGE_ID)
	session.workspaces.push(workspace)

	evictLeastRecentlyUsed(session)

	return workspace
}

function evictLeastRecentlyUsed(session: SessionData): void {
	while (session.workspaces.length > MAX_WORKSPACES) {
		const coldest = session.workspaces.reduce((oldest, workspace) =>
			workspace.lastInteraction < oldest.lastInteraction
				? workspace
				: oldest,
		)

		session.workspaces = session.workspaces.filter(
			(workspace) => workspace !== coldest,
		)
	}
}

/**
 * The workspace behind a message, started empty when the message has none —
 * either because it predates a restart or because its workspace was evicted.
 * The press then lands on a bot that remembers nothing about that message,
 * which idempotent actions survive and mid-flow ones report as unavailable.
 */
export function resolveWorkspace<F extends FlowBase | null>(
	session: SessionData<F>,
	messageId: number,
): Workspace<F> {
	const existing = session.workspaces.find(
		(workspace) => workspace.messageId === messageId,
	)

	if (existing !== undefined) {
		touch(existing)

		return existing
	}

	const workspace = createWorkspace<F>(messageId)
	session.workspaces.push(workspace)

	evictLeastRecentlyUsed(session)

	return workspace
}

/**
 * The workspace awaiting a reply to the given prompt. Replies carry the prompt
 * they answer rather than the message the answer renders onto, so this is how
 * a typed answer finds its way home.
 */
export function findWorkspaceByPrompt<F extends FlowBase | null>(
	session: SessionData<F>,
	promptMessageId: number,
): Workspace<F> | null {
	const workspace = session.workspaces.find(
		(candidate) => candidate.lastAsk?.promptMessageId === promptMessageId,
	)

	if (workspace === undefined) return null

	touch(workspace)

	return workspace
}

/**
 * Adopts the message a freshly sent page landed on, so the pending workspace
 * /start opened becomes reachable by the buttons on that message.
 */
export function claimMessage(workspace: Workspace, messageId: number): void {
	workspace.messageId = messageId
}
