import { useRouter } from 'next/router'

export function getIntId() {
	const router = useRouter()
	const id =
		typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
	return id
}
