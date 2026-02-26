import { Bot } from 'grammy'
import { getEnvSafe } from './utils/common'

const bot = new Bot(getEnvSafe('BOT_TOKEN'))

bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'))
bot.on('message', (ctx) => ctx.reply('Got another message!'))

bot.start()
