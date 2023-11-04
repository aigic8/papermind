import TelegramBot from 'node-telegram-bot-api'
import { DB } from '../db/db'
import { newScienceDirectArticles } from './fetchers/sceinceDirectFetcher'
import { Article } from './fetchers/types'
import dayjs from 'dayjs'
import { CronJob } from 'cron'

export interface ArticleFetcherOptions {
	db: DB
	fetchFreqHours: number
	bot: TelegramBot
}

export function newArticleFetcher({ db, fetchFreqHours, bot }: ArticleFetcherOptions) {
	const start = () => {
		const job = new CronJob(`0 */${fetchFreqHours} * * *`, checkForNewArticles)
		job.start()
	}

	const checkForNewArticles = async () => {
		const sources = await db.sourceGetAll()
		if (sources.length === 0) return
		const groups = await db.groupGetAll()

		for (const source of sources) {
			// if lastId is an empty string, it means it is the first time the source is being checked
			const shouldNotifyUser = source.lastId !== ''
			if (source.kind === 'scienceDirect') {
				const { articles, newLastId } = await newScienceDirectArticles(
					source.url,
					source.lastId
				)
				if (articles.length > 0) {
					await db.sourceSetLastId(source.name, newLastId)
					if (shouldNotifyUser) {
						for (const group of groups)
							for (const article of articles)
								await bot.sendMessage(Number(group.chatId), strNewArticle(article))
					}
				}
			}
		}
	}

	return { checkForNewArticles, start }
}

const strNewArticle = (article: Article) =>
	`${article.title}
${article.authors.join(', ')}
${dayjs(article.publishDate).format('YYYY/MM/DD')}
${article.url}`
