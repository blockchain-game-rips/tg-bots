import { fmt, wait } from '@rips/grammy-kit'
import { AnimationFrame } from '../../domain/reveal-animation'
import { Flow } from '../../flows'
import { EffectType, HandlerResult } from '../../types'

/**
 * Chains frames into recursive loading effects, each rendered with an empty
 * keyboard. The missing keyboard is load-bearing: a stale one would still offer
 * Reveal Next, and a tap mid-animation would race a second reveal on the same
 * message.
 *
 * Loading does not write session.lastNavigatedPage — only navigation does — so
 * frames leave it pointing at the page the user came from. An error thrown
 * mid-animation therefore appends to a page that still has a keyboard rather
 * than stranding the user on a frame with no way out.
 */
export function playFrames(
	frames: AnimationFrame[],
	finish: () => Promise<HandlerResult<Flow>>,
): HandlerResult<Flow> {
	const [frame, ...remaining] = frames

	if (frame === undefined)
		throw new Error('Animation needs at least one frame')

	return {
		effect: {
			type: EffectType.LOADING,
			message: fmt`${frame.text}`,
			next: async () => {
				await wait(frame.durationMs)

				if (remaining.length === 0) return finish()

				return playFrames(remaining, finish)
			},
		},
	}
}
