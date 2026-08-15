import { BACK_ACTION_ID, parseActionData } from '../action/action-data'
import {
	ActionData,
	EffectNavigate,
	HistoryEntry,
	PageContent,
	Workspace,
} from '../types'

export const MAX_HISTORY_DEPTH = 20

/**
 * Where an incoming action should take the user. Back is resolved against the
 * trail; everything else runs its own handler.
 */
export type Navigation =
	| { kind: 'forward'; action: ActionData }
	| { kind: 'back'; to: HistoryEntry }
	| { kind: 'at-root' }

export function resolveNavigation(
	workspace: Workspace,
	action: ActionData,
): Navigation {
	if (action.actionId !== BACK_ACTION_ID) return { kind: 'forward', action }

	const to = previousEntry(workspace)

	if (to === null) return { kind: 'at-root' }

	return { kind: 'back', to }
}

function isSameAction(entry: HistoryEntry, action: ActionData): boolean {
	return (
		entry.kind === 'action' &&
		entry.action.actionId === action.actionId &&
		entry.action.payload === action.payload
	)
}

function push(workspace: Workspace, entry: HistoryEntry): void {
	workspace.history.push(entry)

	if (workspace.history.length > MAX_HISTORY_DEPTH) workspace.history.shift()
}

/** The page currently on screen, or null before the first one is entered. */
function currentEntry(workspace: Workspace): HistoryEntry | null {
	return workspace.history[workspace.history.length - 1] ?? null
}

function previousEntry(workspace: Workspace): HistoryEntry | null {
	return workspace.history[workspace.history.length - 2] ?? null
}

export function recordPage(
	workspace: Workspace,
	action: ActionData,
	effect: EffectNavigate,
): void {
	if (effect.page.sensitive === true) {
		workspace.lastNavigatedPage = null

		return
	}

	workspace.lastNavigatedPage = effect.page

	if (action.actionId === BACK_ACTION_ID) {
		workspace.history.pop()

		return
	}

	if (effect.history?.clears === true) workspace.history = []

	const entry = resolveEntry(action, effect)
	recordEntry(workspace, entry)
}

function resolveEntry(
	action: ActionData,
	effect: EffectNavigate,
): HistoryEntry {
	if (effect.history?.kind === 'page') {
		return { kind: 'page', page: effect.page }
	}

	const { replayWith } = effect.history ?? {}

	if (replayWith !== undefined)
		return { kind: 'action', action: parseActionData(replayWith) }

	return { action, kind: 'action' }
}

function recordEntry(workspace: Workspace, entry: HistoryEntry) {
	switch (entry.kind) {
		case 'action': {
			recordActionEntry(workspace, entry.action)
			return
		}

		case 'page': {
			recordPageEntry(workspace, entry.page)
			return
		}
	}
}

function recordActionEntry(workspace: Workspace, action: ActionData): void {
	const current = currentEntry(workspace)

	// opening the same page shouldn't be saved to history or back button will lead at the same page
	if (current !== null && isSameAction(current, action)) return

	push(workspace, { kind: 'action', action })
}

function recordPageEntry(workspace: Workspace, page: PageContent): void {
	// too much memory consumption for saving image in history
	if (page.photo !== undefined) return

	if (holdsSlotOf(currentEntry(workspace), page)) workspace.history.pop()

	push(workspace, { kind: 'page', page })
}

/** Whether the entry on screen is the one this page supersedes. */
function holdsSlotOf(entry: HistoryEntry | null, page: PageContent): boolean {
	return (
		entry?.kind === 'page' &&
		page.trailSlot !== undefined &&
		entry.page.trailSlot === page.trailSlot
	)
}
