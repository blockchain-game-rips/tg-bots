import {
	notificationsControllerGetNotifications,
	notificationsControllerMarkNotified,
	RipDto,
} from '@rips/api-client'
import { logger } from '@rips/grammy-kit'
import { Bot } from 'grammy'
import { GlobalClaimedRipPage } from './pages/notifications/global-claimed-page'
import { GlobalRefundedRipPage } from './pages/notifications/global-refunded-page'
import { UserClaimedRipPage } from './pages/notifications/user-claimed-page'
import { UserRefundedRipPage } from './pages/notifications/user-refunded-page'
import { Context, PageContent } from './types'
import { fetchRips } from './utils/api/wrappers'
import { getEnvSafe, wait } from './utils/common'

const POLL_INTERVAL_MS = 5000
const BETWEEN_NOTIFICATIONS_DELAY_MS = 500
const GROUP_USER_ID = '0'

type NotificationType = 'CLAIMED' | 'REFUNDED'

const NOTIFICATION_TYPES: NotificationType[] = ['CLAIMED', 'REFUNDED']

function isNotificationType(value: string): value is NotificationType {
	return (NOTIFICATION_TYPES as string[]).includes(value)
}

type PageBuilder = (rip: RipDto) => PageContent

const groupPages: Record<NotificationType, PageBuilder> = {
	CLAIMED: (rip) => GlobalClaimedRipPage.render(rip),
	REFUNDED: (rip) => GlobalRefundedRipPage.render(rip),
}

const userPages: Record<NotificationType, PageBuilder> = {
	CLAIMED: (rip) => UserClaimedRipPage.render(rip),
	REFUNDED: (rip) => UserRefundedRipPage.render(rip),
}

export class Notifier {
	private readonly gameGroupId = getEnvSafe('GAME_GROUP_ID')

	constructor(private readonly bot: Bot<Context>) {}

	run() {
		void this.pollLoop()
	}

	private async pollLoop() {
		for (;;) {
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
			const rips = await fetchRips([Number(notification.ripId)])

			const rip = rips[0]

			if (!rip) {
				logger.error({ notification }, 'Rip not found for notification')
				continue
			}

			if (!isNotificationType(notification.type)) {
				logger.error({ notification }, 'Unknown notification type')
				continue
			}

			const isGroupNotification =
				notification.userTelegramId === GROUP_USER_ID
			const pages = isGroupNotification ? groupPages : userPages
			const buildPage = pages[notification.type]

			const chatId = isGroupNotification
				? this.gameGroupId
				: notification.userTelegramId

			try {
				await this.sendNotification(chatId, buildPage(rip))
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
		await this.bot.api.sendMessage(chatId, page.message.text, {
			reply_markup: page.keyboard,
			entities: page.message.entities,
		})
	}
}
