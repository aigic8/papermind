import TelegramBot, { ChatMemberUpdated } from 'node-telegram-bot-api'
import { DB } from '../db/db'
import { newArticleFetcher } from './articleFetcher'

interface BotOptions {
	token: string
	db: DB
	fetchFreqHours: number
}

export function newBot({ token, db, fetchFreqHours }: BotOptions) {
	const onMyChatMember = async (myChatMember: ChatMemberUpdated) => {
		if (myChatMember.chat.type !== 'group') return
		const newStatus = myChatMember.new_chat_member.status
		if (newStatus === 'member') await db.groupCreate(BigInt(myChatMember.chat.id))
		else if (newStatus === 'kicked' || newStatus === 'left')
			await db.groupDelete(BigInt(myChatMember.chat.id))
	}
	const bot = new TelegramBot(token)
	bot.on('my_chat_member', onMyChatMember)

	const start = async () => {
		const articleFetcher = newArticleFetcher({ db, fetchFreqHours, bot })
		await bot.startPolling()
		await articleFetcher.checkForNewArticles()
		articleFetcher.start()
	}

	const stop = async () => {
		await bot.stopPolling()
	}

	return { start, stop }
}
