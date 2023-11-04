import Parser from 'rss-parser'
import { Article } from './types'
import dayjs from 'dayjs'

export async function newScienceDirectArticles(url: string, lastId: string) {
	const parser = new Parser()
	const feed = await parser.parseURL(url)
	const articles: Article[] = []
	let newLastId = lastId
	for (const item of feed.items) {
		const { title, link, content, guid } = item
		if (!title || !link || !content || !guid) continue
		if (guid === lastId) break
		const authors = extractAuthors(content)
		const publishDate = extractPubDate(content)
		if (!authors || !publishDate) continue
		newLastId = guid
		articles.push({ title, url: link, authors, publishDate })
		if (item.guid === lastId) break
	}
	return { articles, newLastId }
}

function extractAuthors(content: string): string[] | null {
	const reg = /Author\(s\): ([A-Za-z\s,]+)/
	if (reg.test(content)) {
		const matches = content.match(reg)
		if (matches === null || matches.length === 0) return null
		const authorsStr = removePrefix(matches[0], 'Author(s):').trim()
		return authorsStr.split(',').map(author => author.trim())
	}
	return null
}

function extractPubDate(content: string): Date | null {
	const reg = /Publication date:\s+(\d+\s+[A-Za-z]+\s+\d{4})/
	if (reg.test(content)) {
		const matches = content.match(reg)
		if (matches === null || matches.length === 0) return null
		const pubDateStr = removePrefix(matches[0], 'Publication Date:').trim()
		return dayjs(pubDateStr, 'D MMMM YYYY').toDate()
	}
	return null
}

function removePrefix(str: string, prefix: string) {
	if (str.startsWith(prefix)) return str.slice(prefix.length)
	return str
}
