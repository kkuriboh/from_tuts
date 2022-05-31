import DataLoader from 'dataloader'
import { User } from '../entities/User'
export function createUserLoader() {
	return new DataLoader<number, User>(async (keys) => {
		const users = await User.findByIds(keys as number[])
		const userIdToUser: Record<number, User> = {}
		users.forEach((u) => {
			userIdToUser[u.id] = u
		})
		return keys.map((key) => userIdToUser[key])
	})
}
