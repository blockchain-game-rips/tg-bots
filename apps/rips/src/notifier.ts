import { Bot } from 'grammy'
import {
	notificationsControllerGetNotifications,
	notificationsControllerMarkNotified,
	ripsControllerGetRounds,
} from '../generated/api-client'
import { logger } from './logging/pino-logger'
import { GlobalClaimedRoundPage } from './pages/notifications/global-claimed-page'
import { GlobalRefundedRoundPage } from './pages/notifications/global-refunded-page'
import { UserClaimedRoundPage } from './pages/notifications/user-claimed-page'
import { UserRefundedRoundPage } from './pages/notifications/user-refunded-page'
import { Context, PageContent } from './types'
import { getEnvSafe, wait } from './utils/common'

const POLL_INTERVAL_MS = 5000
const BETWEEN_NOTIFICATIONS_DELAY_MS = 500
const GROUP_USER_ID = '0'

type NotificationType = 'CLAIMED' | 'REFUNDED'
type RoundDto = Parameters<typeof GlobalClaimedRoundPage.render>[0]
type PageBuilder = (round: RoundDto) => PageContent

const groupPages: Record<NotificationType, PageBuilder> = {
	CLAIMED: GlobalClaimedRoundPage.render,
	REFUNDED: GlobalRefundedRoundPage.render,
}

const userPages: Record<NotificationType, PageBuilder> = {
	CLAIMED: UserClaimedRoundPage.render,
	REFUNDED: UserRefundedRoundPage.render,
}

export class Notifier {
	private readonly gameGroupId = getEnvSafe('GAME_GROUP_ID')

	constructor(private readonly bot: Bot<Context>) {}

	run() {
		void this.pollLoop()
	}

	private async pollLoop() {
		while (true) {
			try {
				await this.fetchAndHandleNotifications()
			} catch (err) {
				logger.error(err)
			}

			await wait(POLL_INTERVAL_MS)
		}
	}

	private async fetchAndHandleNotifications() {
		const { data: notificationsData } =
			await notificationsControllerGetNotifications()

		for (const notification of notificationsData.notifications) {
			const { data: roundsData } = await ripsControllerGetRounds({
				query: { ids: [Number(notification.roundId)] },
			})

			const round = roundsData.rounds[0]

			if (!round) {
				logger.error(
					{ notification },
					'Round not found for notification',
				)
				continue
			}

			const type = notification.type as NotificationType
			const isGroupNotification = notification.userId === GROUP_USER_ID
			const pages = isGroupNotification ? groupPages : userPages
			const buildPage = pages[type]

			if (!buildPage) {
				logger.error({ notification }, 'Unknown notification type')
				continue
			}

			const chatId = isGroupNotification
				? this.gameGroupId
				: notification.userId

			try {
				await this.sendNotification(chatId, buildPage(round))
				await notificationsControllerMarkNotified({
					path: { notificationId: notification.id },
				})
			} catch (err) {
				logger.error(
					{ err, notification },
					'Failed to send notification',
				)
			}

			await wait(BETWEEN_NOTIFICATIONS_DELAY_MS)
		}
	}

	private async sendNotification(chatId: string, page: PageContent) {
		await this.bot.api.sendMessage(chatId, page.message, {
			reply_markup: page.keyboard,
			parse_mode: 'HTML',
		})
	}
}
