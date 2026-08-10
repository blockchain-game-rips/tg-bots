/**
 * Every frame sits at or above 750ms to stay within Telegram's roughly
 * one-edit-per-second-per-chat budget. Faster frames would not error with
 * auto-retry installed, but would stall unpredictably and could make a fast
 * reveal land slower than a medium one.
 */
const MIN_FRAME_MS = 750
const STANDARD_FRAME_MS = 1000
const SLOW_BUILD_MS = 1500
const SLOW_PAYOFF_MS = 2500

export interface AnimationFrame {
	text: string
	durationMs: number
}

/**
 * Every band opens on this text, which is what lets the reveal request run
 * behind frame one before the tier — and so the band — is known. Held at the
 * floor duration so the opening frame never outlasts the band it turns out to
 * belong to; the band's own timing takes over from frame two.
 */
export const OPENING_FRAME: AnimationFrame = {
	text: '🎁 Opening pull...',
	durationMs: MIN_FRAME_MS,
}

const FAST_FRAMES: AnimationFrame[] = [
	OPENING_FRAME,
	{ text: '✨ Revealing card...', durationMs: MIN_FRAME_MS },
]

/**
 * "Rare signal" is the English word, not the tier name — this frame is shared
 * by Rare and Epic and must not identify which is landing.
 */
const MEDIUM_FRAMES: AnimationFrame[] = [
	{ text: '🎁 Opening pull...', durationMs: STANDARD_FRAME_MS },
	{ text: '✨ Card energy rising...', durationMs: STANDARD_FRAME_MS },
	{ text: '🔵 Rare signal detected...', durationMs: STANDARD_FRAME_MS },
]

/** Weighted rather than evenly split, so the longest pause falls immediately before the payoff. */
const SLOW_FRAMES: AnimationFrame[] = [
	{ text: '🎁 Opening pull...', durationMs: STANDARD_FRAME_MS },
	{ text: '⚡ Something is happening...', durationMs: SLOW_BUILD_MS },
	{ text: '🔥 High-tier signal detected...', durationMs: SLOW_PAYOFF_MS },
]

export const REVEAL_ALL_FRAMES: AnimationFrame[] = [
	{ text: '🎁 Opening all pulls...', durationMs: STANDARD_FRAME_MS },
	{ text: '✨ Revealing results...', durationMs: STANDARD_FRAME_MS },
	{ text: '🃏 Sorting cards...', durationMs: STANDARD_FRAME_MS },
]

/**
 * Reveal All also opens on the shared frame so the unopened count can pick the
 * path before batch-specific copy appears, so its own opening frame is replaced
 * and the shortfall folded into the next one.
 */
export function batchFramesAfterOpening(): AnimationFrame[] {
	return foldOpeningShortfall(REVEAL_ALL_FRAMES)
}

const MEDIUM_BAND_MIN_TIER = 3
const SLOW_BAND_MIN_TIER = 5

/**
 * Spark (index 2) sits in the fast band: it is in the bottom half by index and
 * will be a frequent outcome, and tiered pacing exists so frequent outcomes
 * stay quick.
 */
export function framesForTier(tierIndex: number): AnimationFrame[] {
	if (tierIndex >= SLOW_BAND_MIN_TIER) return SLOW_FRAMES

	if (tierIndex >= MEDIUM_BAND_MIN_TIER) return MEDIUM_FRAMES

	return FAST_FRAMES
}

/**
 * Drops a sequence's own opening frame, which the shared OPENING_FRAME has
 * already played, and folds the difference in their durations into the next
 * frame so the sequence still lands on its specified total.
 */
function foldOpeningShortfall(frames: AnimationFrame[]): AnimationFrame[] {
	const [opening, ...remaining] = frames

	const [next, ...rest] = remaining

	if (opening === undefined || next === undefined) return remaining

	const shortfall = opening.durationMs - OPENING_FRAME.durationMs

	return [{ ...next, durationMs: next.durationMs + shortfall }, ...rest]
}

/** The frames left to play for a tier once the shared opening frame has run. */
export function framesAfterOpening(tierIndex: number): AnimationFrame[] {
	return foldOpeningShortfall(framesForTier(tierIndex))
}
