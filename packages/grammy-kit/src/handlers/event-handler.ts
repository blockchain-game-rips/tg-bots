import { Api } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { openWorkspace } from '../session/workspaces'
import { ActionData, SessionData } from '../types'
import { EMPTY_PAGE } from './empty-page'

type MaybePromise<T> = T | Promise<T>

/**
 * The slice of grammy's session storage this adapter needs — it reads and
 * writes one chat's session, and never enumerates or deletes.
 *
 * Correctness here depends on the storage returning the *same* object on every
 * read, which grammy's in-process `MemorySessionStorage` does and a serialising
 * adapter (Redis, a file) does not. See the concurrency note on
 * `createEventHandler` before swapping it.
 */
export interface EventSessionStorage<F extends FlowBase | null> {
	read: (key: string) => MaybePromise<SessionData<F> | undefined>
	write: (key: string, value: SessionData<F>) => MaybePromise<void>
}

export interface EventHandlerConfig<F extends FlowBase | null> {
	api: Api
	storage: EventSessionStorage<F>
	initial: () => SessionData<F>
	actions: Record<string, BoundAction | undefined>
}

export interface InboundEvent {
	/**
	 * Doubles as the chat id, which holds because the bot serves private chats
	 * only — `main.ts` drops every other update before the session middleware.
	 */
	telegramId: number

	action: ActionData
}

/**
 * The fourth adapter: something that is not a Telegram update drives the bot.
 *
 * A polling bot has no inbound interface, so an event arrives with no update
 * and therefore no middleware-injected session. `EffectRequest` is already
 * transport-independent, so the event routes through the very executor a button
 * press does — the difference is confined to fetching the session by hand and
 * sending a new message rather than editing one, since the event owns no
 * message on screen.
 *
 * The session key is the chat id, matching grammy's own `defaultGetSessionKey`.
 * In the private chats this bot restricts itself to, that is the user's
 * telegram id.
 *
 * ## Concurrency: mutate in place, never replace
 *
 * A button press can be mid-flight when a verdict lands on the same chat, and
 * grammy takes no lock: its middleware reads the session before the handler runs
 * and writes it back after.
 *
 * Interleaving is harmless for a chat that already has a stored session, because
 * storage is grammy's default `MemorySessionStorage`, whose `read` hands back
 * the live object rather than a copy. Both sides hold the same `SessionData`,
 * every mutation in this kit happens in place on it, and the press's write-back
 * re-writes the object the event already mutated — so neither loses the other's
 * work.
 *
 * What that forbids is replacement: assigning a fresh `SessionData` would be
 * silently discarded by the press's later write-back, or would discard the
 * press's own workspace. Hence the read-and-mutate below, seeding storage
 * immediately so a chat that had no session still ends up with one shared
 * object. The read and the seeding write are not separated by an `await` on the
 * in-memory storage, so no press can interleave between them.
 *
 * ## The one race that remains, and why it is accepted
 *
 * A press that *opens* the chat holds its session unwritten: grammy's `load()`
 * builds it from `initial()` and keeps it in memory until its middleware
 * finishes. Storage is therefore still empty when an event lands in that window,
 * both sides build separate objects, and the press's `finish()` overwrites the
 * event's workspace — the page is still delivered, but its workspace is lost, so
 * the buttons on it resolve to an empty workspace and read as a reloaded bot.
 *
 * This is left as-is rather than fixed with a lock. The window is the few
 * milliseconds of a first-ever `/start` racing a verdict for the same user, the
 * gate's own flow puts a user gesture before any verdict, and the failure mode is
 * one the session already has by design (see `resolveWorkspace`, which starts an
 * empty workspace for a message whose own was evicted). Closing it would mean
 * locking a storage grammy gives no lock for.
 *
 * The guarantee belongs to the in-memory storage, not to grammy. A serialising
 * adapter returns a fresh object per read, which breaks the shared reference and
 * makes even the ordinary case a lost update — such a move needs locking or a
 * merge.
 */
export function createEventHandler<F extends FlowBase | null>({
	api,
	storage,
	initial,
	actions,
}: EventHandlerConfig<F>): (event: InboundEvent) => Promise<void> {
	return async function handleEvent(event: InboundEvent): Promise<void> {
		const chatId = event.telegramId

		const key = String(chatId)
		const stored = await storage.read(key)

		const session = stored ?? initial()

		if (stored === undefined) await storage.write(key, session)

		await executeEffectOrDisplayError({
			api,
			chatId,
			telegramId: event.telegramId,
			message: null,
			workspace: openWorkspace(session),
			actions,
			action: event.action,
			fallbackPage: EMPTY_PAGE,
		})
	}
}
