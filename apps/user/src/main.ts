import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { initApiClient } from '@rips/api-client'
import {
	createButtonHandler,
	createEventHandler,
	createMessageHandler,
	createStartHandler,
	createTelegramMetricsTransformer,
	initialSession,
	logger,
	startMetricsServer,
} from '@rips/grammy-kit'
import { Bot, MemorySessionStorage, session } from 'grammy'
import { actionIds } from './action-ids'
import { actions, ungatedActions } from './actions'
import { botStartLink, setBotUsername } from './bot-identity'
import { eligibilityPolicyCache } from './cache/eligibility-policy-cache'
import { userEligibilityCache } from './cache/user-eligibility-cache'
import { buildEligibilityFactHandler } from './eligibility/eligibility-fact'
import { Flow } from './flows'
import { startGate } from './gate'
import { Notifier } from './notifier'
import { initSupportedCurrencies } from './supported-currencies'
import { Context, SessionData } from './types'
import { getEnvSafe } from './utils/common'
import { recordEligibility } from './utils/api/wrappers'
import { installKeyboardExtensions } from './utils/keyboard'

initApiClient(getEnvSafe('BACKEND_URL'))

startMetricsServer()

installKeyboardExtensions()

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.use((ctx, next) => {
	if (ctx.chat?.type !== 'private') return
	return next()
})

bot.api.config.use(autoRetry())
bot.api.config.use(createTelegramMetricsTransformer())

const initial = (): SessionData<Flow> => initialSession<Flow>()

/**
 * The one storage both entrances share: grammy's middleware writes it after
 * every update, and `createEventHandler` reaches it without an update at all.
 *
 * It stays grammy's in-process `MemorySessionStorage` deliberately, because the
 * event path relies on reads returning the live object rather than a copy — a
 * serialising adapter (Redis, a file) would silently turn every concurrent press
 * into a lost update. Read the concurrency note on `createEventHandler` before
 * swapping it.
 */
const sessionStorage = new MemorySessionStorage<SessionData<Flow>>()

bot.use(session({ initial, storage: sessionStorage }))

const handleButton = createButtonHandler(actions)
const handleMessage = createMessageHandler(actions)
const handleStart = createStartHandler(actions, actionIds.openHome)

/**
 * Delivers through the ungated registry: the gate has already ruled, and a
 * second check here would re-read the stored record and replace the page the
 * verdict chose — leaving the region refusal unreachable.
 */
const handleEvent = createEventHandler<Flow>({
	api: bot.api,
	storage: sessionStorage,
	initial,
	actions: ungatedActions,
})

/**
 * The gate's public listener, on its own port beside the metrics one. Only the
 * gate's port is ever published — `/metrics` stays internal, and one server
 * serving both would mean any firewall slip leaks it.
 *
 * The gate reports a fact and stops; the verdict, the write and the page all
 * belong to the bot, which reaches the chat through `createEventHandler`. The
 * gate answers the mini app as soon as this resolves, whatever the verdict, so a
 * legitimately blocked user still gets a 200 and reads the refusal in the chat.
 */
startGate(
	buildEligibilityFactHandler({
		policyCache: eligibilityPolicyCache,
		record: recordEligibility,
		invalidate: (telegramId) => userEligibilityCache.invalidate(telegramId),
		deliver: handleEvent,
		homeActionId: actionIds.openHome,
		blockedActionId: actionIds.openEligibilityBlocked,
	}),
)

bot.command('start', async (ctx) => handleStart(ctx))

bot.on('callback_query:data', async (ctx) => handleButton(ctx))

bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

const LAST_UPDATE_ONLY_OFFSET = -1

async function dropPendingUpdates() {
	const [lastUpdate] = await bot.api.getUpdates({
		offset: LAST_UPDATE_ONLY_OFFSET,
		timeout: 0,
	})

	if (lastUpdate === undefined) return

	await bot.api.getUpdates({
		offset: lastUpdate.update_id + 1,
		timeout: 0,
	})
}

async function start() {
	await initSupportedCurrencies()

	const me = await bot.api.getMe()

	setBotUsername(me.username)

	await dropPendingUpdates()

	run(bot)

	const notifier = new Notifier(bot, botStartLink())
	notifier.run()
}

start().catch((error: unknown) => {
	logger.error(error, 'Failed to start bot')
	process.exit(1)
})
