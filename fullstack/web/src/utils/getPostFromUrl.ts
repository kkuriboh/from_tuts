import { usePostQuery } from '../generated/graphql'
import { getIntId } from './getIntId'

export function getPostFromUrl() {
	const id = getIntId()
	return usePostQuery({
		pause: id === -1,
		variables: {
			id,
		},
	})
}
