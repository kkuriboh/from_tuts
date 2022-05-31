import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'
import { useDeletePostMutation, useMeQuery } from '../generated/graphql'

type PostStateButtonsProps = {
	id: number
	OPId: number
}

export default function PostStateButtons({ id, OPId }: PostStateButtonsProps) {
	const [deletePost] = useDeletePostMutation()
	const { data } = useMeQuery()

	if (data?.me?.id !== OPId) {
		return null
	}

	return (
		<Box>
			<NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
				<IconButton
					colorScheme='blue'
					aria-label='edit post'
					icon={<EditIcon />}
					mr={2}
				/>
			</NextLink>
			<IconButton
				colorScheme='red'
				aria-label='delete post'
				icon={<DeleteIcon />}
				onClick={() => {
					deletePost({
						variables: { id },
						update: (cache) => {
							cache.evict({ id: 'Post:' + id })
						},
					})
				}}
			/>
		</Box>
	)
}
