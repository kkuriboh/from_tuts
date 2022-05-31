import { ApolloCache, gql } from '@apollo/client'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import React, { useState } from 'react'
import {
	PostSnippetFragment,
	useVoteMutation,
	VoteMutation,
} from '../generated/graphql'

type UpdootSectionProps = {
	post: PostSnippetFragment
}

function updateAfterVote(
	value: number,
	cache: ApolloCache<VoteMutation>,
	postId: number
) {
	const data = cache.readFragment<{
		id: number
		rank: number
		voteStatus: number | null
	}>({
		id: 'Post:' + postId,
		fragment: gql`
			fragment _ on Post {
				id
				rank
				voteStatus
			}
		`,
	})
	if (data) {
		let newRank = 0
		switch (value) {
			case 3:
				newRank = (data.rank as number) + -1
				break
			case 4:
				newRank = (data.rank as number) + 1
				break
			default:
				newRank =
					(data.rank as number) + (!data.voteStatus ? 1 : 2) * value
				break
		}
		cache.writeFragment({
			id: 'Post:' + postId,
			fragment: gql`
				fragment __ on Post {
					rank
					voteStatus
				}
			`,
			data: {
				rank: newRank,
				voteStatus: value,
			},
		})
	}
}

export default function UpdootSection({ post }: UpdootSectionProps) {
	const [loadingState, setLoadingState] = useState<
		'updoot-loading' | 'downdoot-loading' | 'not-loading'
	>('not-loading')
	const [vote] = useVoteMutation()
	return (
		<Flex
			direction='column'
			justifyContent='space-between'
			alignItems='center'
			mr={4}
		>
			<IconButton
				onClick={async () => {
					if (post.voteStatus === 1) {
						await vote({
							variables: {
								postId: post.id,
								value: 3,
							},
							update: (cache) =>
								updateAfterVote(3, cache, post.id),
						})
						return
					}
					setLoadingState('updoot-loading')
					await vote({
						variables: { postId: post.id, value: 1 },
						update: (cache) => updateAfterVote(1, cache, post.id),
					})
					setLoadingState('not-loading')
				}}
				colorScheme={post.voteStatus === 1 ? 'green' : undefined}
				isLoading={loadingState === 'updoot-loading'}
				icon={<ChevronUpIcon />}
				aria-label='upvote'
			/>
			{post.rank}
			<IconButton
				onClick={async () => {
					if (post.voteStatus === -1) {
						await vote({
							variables: {
								postId: post.id,
								value: 4,
							},
							update: (cache) =>
								updateAfterVote(4, cache, post.id),
						})
						return
					}
					setLoadingState('downdoot-loading')
					await vote({
						variables: { postId: post.id, value: -1 },
						update: (cache) => updateAfterVote(-1, cache, post.id),
					})
					setLoadingState('not-loading')
				}}
				colorScheme={post.voteStatus === -1 ? 'red' : undefined}
				isLoading={loadingState === 'downdoot-loading'}
				icon={<ChevronDownIcon />}
				aria-label='downvote'
			/>
		</Flex>
	)
}
