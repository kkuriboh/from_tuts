import DataLoader from 'dataloader'
import { Updoot } from '../entities/Updoot'

export function createUpdootLoader() {
	return new DataLoader<{ postId: number; userId: number }, Updoot | null>(
		async (keys) => {
			const updoots = await Updoot.findByIds(keys as any)
			const updootIdToUpdoot: Record<string, Updoot> = {}
			updoots.forEach((u) => {
				updootIdToUpdoot[`${u.userId}|${u.postId}`] = u
			})
			return keys.map(
				(key) => updootIdToUpdoot[`${key.userId}|${key.postId}`]
			)
		}
	)
}
