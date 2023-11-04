import { PrismaClient, Source as DBSource } from '@prisma/client'

export type SourceKind = 'scienceDirect'

export interface SourceCreateOptions {
	name: string
	kind: SourceKind
	url: string
	lastId?: string
}

export type DB = ReturnType<typeof newDB>

type Source = Omit<DBSource, 'kind'> & { kind: SourceKind }

export function newDB() {
	const prisma = new PrismaClient()

	const groupCreate = (chatId: bigint) => prisma.group.create({ data: { chatId } })
	const groupDelete = (chatId: bigint) => prisma.group.delete({ where: { chatId } })
	const groupGetAll = () => prisma.group.findMany()

	const sourceCreate = (o: SourceCreateOptions) =>
		prisma.source.create({ data: { lastId: '', ...o } }) as Promise<Source>
	const sourceGet = (name: string) => prisma.source.findUnique({ where: { name } })
	const sourceGetAll = () => prisma.source.findMany() as Promise<Source[]>
	const sourceSetLastId = (name: string, lastId: string) =>
		prisma.source.update({ where: { name }, data: { lastId } }) as Promise<Source>

	const close = () => prisma.$disconnect()

	return {
		groupCreate,
		groupDelete,
		groupGetAll,

		sourceCreate,
		sourceGet,
		sourceGetAll,
		sourceSetLastId,

		close,
	}
}
