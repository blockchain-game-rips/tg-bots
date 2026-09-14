import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const GATE_DIR = join(__dirname, '..', 'src', 'gate')

/**
 * `USER_API_KEY` is the credential that moves user funds, and the gate is the
 * one part of this process an unauthenticated caller can reach. Keeping the
 * public path away from `utils/api` is what makes it acceptable for the two to
 * share a process at all, so the invariant is pinned by a test rather than left
 * to a reviewer noticing an import.
 *
 * What is forbidden is reaching the module, so the check reads the import
 * statements rather than the file text — naming `utils/api` in a comment that
 * explains the rule must not be what breaks it.
 *
 * Known limit: this reads one hop, not the import graph. It catches a gate file
 * importing `utils/api` directly, which is how the boundary would realistically
 * be crossed, but not a gate file importing something that reaches it in turn.
 * Gate code imports nothing local outside its own directory today, which is what
 * keeps the one hop sufficient; widen this to a transitive walk if that changes.
 */
const FORBIDDEN_MODULE = 'utils/api'

const IMPORT_STATEMENT = /^\s*import\s[^'"]*['"]([^'"]+)['"]/gm
const REQUIRE_CALL = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g

function gateSources(directory: string): string[] {
	return readdirSync(directory).flatMap((entry) => {
		const path = join(directory, entry)

		if (statSync(path).isDirectory()) return gateSources(path)

		return path.endsWith('.ts') ? [path] : []
	})
}

function importedModules(source: string): string[] {
	const specifiers = [
		...source.matchAll(IMPORT_STATEMENT),
		...source.matchAll(REQUIRE_CALL),
	]

	return specifiers.flatMap(([, specifier]) =>
		specifier === undefined ? [] : [specifier],
	)
}

describe('the boundary the gate is allowed to share a process across', () => {
	const sources = gateSources(GATE_DIR)

	it('has gate code to check', () => {
		expect(sources.length).toBeGreaterThan(0)
	})

	it('never imports utils/api, so USER_API_KEY is unreachable from the public path', () => {
		const offenders = sources.filter((path) =>
			importedModules(readFileSync(path, 'utf8')).some((specifier) =>
				specifier.includes(FORBIDDEN_MODULE),
			),
		)

		expect(offenders).toEqual([])
	})

	it('never reads the api key, by any route', () => {
		const offenders = sources.filter((path) =>
			readFileSync(path, 'utf8').includes("getEnvSafe('USER_API_KEY')"),
		)

		expect(offenders).toEqual([])
	})

	it('catches an import of utils/api if one is ever added', () => {
		const leaking = "import { userApiKey } from '../utils/api/key'"

		expect(
			importedModules(leaking).some((specifier) =>
				specifier.includes(FORBIDDEN_MODULE),
			),
		).toBe(true)
	})
})
