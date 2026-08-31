import { readFileSync, writeFileSync } from 'node:fs'
import {
	allocateActionIds,
	assertLockfileCovers,
	parseLockfile,
	serializeLockfile,
	type ActionIdLockfile,
} from './action-ids-lockfile'

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

function readLockfile(path: string): ActionIdLockfile {
	try {
		return parseLockfile(readFileSync(path, 'utf8'))
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT')
			return parseLockfile(undefined)

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

	if (changed) writeFileSync(lockfilePath, serializeLockfile(lockfile))

	return { lockfile, changed }
}
