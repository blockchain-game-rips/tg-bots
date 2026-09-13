import { FormattedString } from '@grammyjs/parse-mode'
import {
	ActionContext,
	ActionRegistryFor,
	AnyActionDef,
	AnyHandlerResult,
	EffectType,
	noPayloadId,
	toHold,
	withPayloadId,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { describe, expect, it, vi } from 'vitest'
import { actionIds } from '../src/action-ids'
import { actionRegistry } from '../src/action-registry'
import { buildGatedRegistry } from '../src/gated-registry'

const TELEGRAM_ID = 111

const actionContext: ActionContext = { telegramId: TELEGRAM_ID, flow: null }

function pageResult(message: string): AnyHandlerResult {
	return {
		flow: toHold(),
		effect: {
			type: EffectType.NAVIGATE,
			page: {
				message: FormattedString.bold(message),
				keyboard: new InlineKeyboard(),
			},
		},
	}
}

const declarations = {
	openHome: noPayloadId(),
	openRip: withPayloadId<number>(),
}

type Declarations = typeof declarations

function stubRegistry(
	handler: () => AnyHandlerResult,
): ActionRegistryFor<Declarations> {
	return {
		openHome: {
			encode: () => '',
			decode: (): void => undefined,
			handler,
		},
		openRip: {
			encode: (ripId) => ripId.toString(),
			decode: (raw) => Number(raw),
			handler,
		},
	}
}

/** `Object.keys` widens to string, which loses the registry's own key union. */
function registryNames(): (keyof typeof actionRegistry)[] {
	return Object.keys(actionRegistry).filter(
		(name): name is keyof typeof actionRegistry => name in actionRegistry,
	)
}

describe('buildGatedRegistry', () => {
	it('reaches the handler when the check returns undefined', async () => {
		const handler = vi.fn(() => pageResult('handler'))

		const gated = buildGatedRegistry(stubRegistry(handler), () =>
			Promise.resolve(undefined),
		)

		const result = await gated.openHome.handler(actionContext, undefined)

		expect(handler).toHaveBeenCalledOnce()
		expect(result).toEqual(pageResult('handler'))
	})

	it('replaces the result and skips the handler when the check returns one', async () => {
		const handler = vi.fn(() => pageResult('handler'))

		const gated = buildGatedRegistry(stubRegistry(handler), () =>
			Promise.resolve(pageResult('consent')),
		)

		const result = await gated.openHome.handler(actionContext, undefined)

		expect(handler).not.toHaveBeenCalled()
		expect(result).toEqual(pageResult('consent'))
	})

	it('passes the action context and payload through to the handler', async () => {
		const handler = vi.fn(() => pageResult('handler'))

		const RIP_ID = 42

		const gated = buildGatedRegistry(stubRegistry(handler), () =>
			Promise.resolve(undefined),
		)

		await gated.openRip.handler(actionContext, RIP_ID)

		expect(handler).toHaveBeenCalledWith(actionContext, RIP_ID)
	})

	it('gates every entry of the real registry, so a new action cannot escape', async () => {
		const check = vi.fn(() => Promise.resolve(pageResult('consent')))

		const gated = buildGatedRegistry<typeof actionIds>(
			actionRegistry,
			check,
		)

		const names = registryNames()

		expect(names.length).toBeGreaterThan(0)

		for (const name of names) {
			check.mockClear()

			// Typed as the union of every entry, so the payload narrows to
			// `never`. The check runs before the handler ever sees a payload,
			// which is what this test is about.
			const def: AnyActionDef = gated[name]

			const result = await def.handler(actionContext, undefined)

			expect(
				check,
				`${name} did not consult the check`,
			).toHaveBeenCalledOnce()

			expect(result, `${name} did not return the refusal`).toEqual(
				pageResult('consent'),
			)
		}
	})

	it('preserves the codec of every entry', () => {
		const gated = buildGatedRegistry<typeof actionIds>(actionRegistry, () =>
			Promise.resolve(undefined),
		)

		for (const name of registryNames()) {
			const original = actionRegistry[name]
			const wrapped = gated[name]

			expect(wrapped.encode, name).toBe(original.encode)
			expect(wrapped.decode, name).toBe(original.decode)
		}
	})
})
