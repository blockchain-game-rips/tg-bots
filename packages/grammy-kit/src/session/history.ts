import { BACK_ACTION_ID } from '../action/action-data'
import {
	ActionData,
	EffectEdit,
	HistoryEntry,
	PageContent,
	SessionData,
} from '../types'

export const MAX_HISTORY_DEPTH = 20

function isSameAction(entry: HistoryEntry, action: ActionData): boolean {
	return (
		entry.kind === 'action' &&
		entry.action.actionId === action.actionId &&
		entry.action.payload === action.payload
	)
}

function push(session: SessionData, entry: HistoryEntry): void {
	session.history.push(entry)

	if (session.history.length > MAX_HISTORY_DEPTH) session.history.shift()
}

/** The page currently on screen, or null before the first one is entered. */
function currentEntry(session: SessionData): HistoryEntry | null {
	return session.history[session.history.length - 1] ?? null
}

export function previousEntry(session: SessionData): HistoryEntry | null {
	return session.history[session.history.length - 2] ?? null
}

export function recordPage(
	session: SessionData,
	action: ActionData,
	effect: EffectEdit,
): void {
	session.lastPage = effect.page

	if (action.actionId === BACK_ACTION_ID) {
		session.history.pop()

		return
	}

	if (effect.history?.clears === true) session.history = []

	const entry = resolveEntry(action, effect)
	recordEntry(session, entry)
}

function resolveEntry(action: ActionData, effect: EffectEdit): HistoryEntry {
	if (effect.history?.kind === 'page') {
		return { kind: 'page', page: effect.page }
	}

	return { action, kind: 'action' }
}

function recordEntry(session: SessionData, entry: HistoryEntry) {
	switch (entry.kind) {
		case 'action': {
			recordActionEntry(session, entry.action)
			return
		}

		case 'page': {
			recordPageEntry(session, entry.page)
			return
		}
	}
}

function recordActionEntry(session: SessionData, action: ActionData): void {
	const current = currentEntry(session)

	// opening the same page shouldn't be saved to history or back button will lead at the same page
	if (current !== null && isSameAction(current, action)) return

	push(session, { kind: 'action', action })
}

function recordPageEntry(session: SessionData, page: PageContent): void {
	// too much memory consumption for saving image in history
	if (page.photo !== undefined) return

	push(session, { kind: 'page', page })
}
