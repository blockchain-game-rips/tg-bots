import { readFileSync, writeFileSync } from 'node:fs'
import {
	allocateActionIds,
	assertLockfileCovers,
	parseLockfileText,
	serializeLockfile,
	type ActionIdLockfile,
} from './action-ids-lockfile'

const FILE_NOT_FOUND_CODE = 'ENOENT'

export interface SyncOptions {
	lockfilePath: string
	declaredNames: string[]

	/** Verify only: report drift instead of writing. Used by the pre-commit hook. */
	check: boolean
}

export interface SyncResult {
	lockfile: ActionIdLockfile
	changed: boolean
}

function isFileNotFound(error: unknown): boolean {
	return (
		error instanceof Error &&
		'code' in error &&
		error.code === FILE_NOT_FOUND_CODE
	)
}

function readLockfile(path: string): ActionIdLockfile {
	try {
		return parseLockfileText(readFileSync(path, 'utf8'))
	} catch (error) {
		if (isFileNotFound(error)) return parseLockfileText(undefined)

		throw error
	}
}

export function syncActionIds({
	lockfilePath,
	declaredNames,
	check,
}: SyncOptions): SyncResult {
	const current = readLockfile(lockfilePath)

	if (check) {
		assertLockfileCovers(current, declaredNames)

		return { lockfile: current, changed: false }
	}

	const { lockfile, changed } = allocateActionIds(current, declaredNames)

	// Allocation carries existing entries over untouched, so a lockfile damaged
	// by hand would otherwise pass here and only fail at bot startup.
	assertLockfileCovers(lockfile, declaredNames)

	if (changed) writeFileSync(lockfilePath, serializeLockfile(lockfile))

	return { lockfile, changed }
}
