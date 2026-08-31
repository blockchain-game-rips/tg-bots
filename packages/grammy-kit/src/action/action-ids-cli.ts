import { syncActionIds } from './sync-action-ids'

const CHECK_FLAG = '--check'

/**
 * Entry point for each app's `action-ids` script. Writing by default and
 * verifying under `--check` lets the same script serve both the developer
 * adding an action and the pre-commit hook guarding the lockfile.
 */
export function runActionIdsCli(
	lockfilePath: string,
	declaredNames: string[],
	argv: string[] = process.argv.slice(2),
): void {
	const check = argv.includes(CHECK_FLAG)

	try {
		const { changed } = syncActionIds({
			lockfilePath,
			declaredNames,
			check,
		})

		if (changed) console.log(`Updated ${lockfilePath}`)
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error))
		process.exitCode = 1
	}
}
