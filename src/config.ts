import { z } from 'zod'
import * as fs from 'node:fs/promises'
import yaml from 'yaml'

const config = z.object({
	token: z.string(),
	fetchFreqHours: z.number().max(8),
	sources: z.array(
		z.object({
			name: z.string(),
			url: z.string().url(),
			kind: z.enum(['scienceDirect']),
		})
	),
})
export type Config = z.infer<typeof config>

export async function parseConfig(configPath: string): Promise<Config> {
	const yamlStr = await fs.readFile(configPath, { encoding: 'utf8' })
	const configData = yaml.parse(yamlStr)
	return config.parse(configData)
}
