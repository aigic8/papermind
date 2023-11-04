import { newBot } from './bot/bot'
import { parseConfig } from './config'
import { newDB } from './db/db'

const CONFIG_PATH = 'paperMind.yaml'

async function main() {
	const db = newDB()
	const { token, fetchFreqHours, sources } = await parseConfig(CONFIG_PATH)

	for (const source of sources) {
		const { kind, name, url } = source
		const dbSource = await db.sourceGet(name)
		if (!dbSource) await db.sourceCreate({ kind, name, url })
	}

	const bot = newBot({ token, db, fetchFreqHours })
	await bot.start()
}

main()
