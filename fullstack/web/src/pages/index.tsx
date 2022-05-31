import { withUrqlClient } from 'next-urql'
import createUrqlClient from '../utils/createUrqlClient'
import {
	PostsQuery,
	useDeletePostMutation,
	useMeQuery,
	usePostsQuery,
} from '../generated/graphql'
import Layout from '../components/Layout'
import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { Button, IconButton } from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import React, { useState } from 'react'
import UpdootSection from '../components/UpdootSection'
import PostStateButtons from '../components/PostStateButtons'
import { withApolloClient } from '../utils/withApolloClient'

function Index() {
	const { data, loading, fetchMore, variables } = usePostsQuery({
		variables: {
			limit: 10,
			cursor: null,
		},
		notifyOnNetworkStatusChange: true,
	})

	if (!loading && !data) {
		return <Text>query failed</Text>
	}

	return (
		<Layout>
			{!data && loading ? (
				<div>Loading...</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((post) =>
						!post ? null : (
							<Flex
								key={post.id}
								p={5}
								shadow='md'
								borderWidth='1px'
							>
								<UpdootSection post={post} />
								<Box flex={1}>
									<NextLink
										href='/post/[id]'
										as={`/post/${post.id}`}
									>
										<Link>
											<Heading fontSize='xl'>
												{post.title}
											</Heading>
										</Link>
									</NextLink>
									<Text>posted by {post.OP.username}</Text>
									<Flex ml='auto'>
										<Text flex={1} mt={4}>
											{post.textSnippet}
										</Text>
										<PostStateButtons
											id={post.id}
											OPId={post.OP.id}
										/>
									</Flex>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							fetchMore({
								variables: {
									limit: variables?.limit,
									cursor: data.posts.posts[
										data.posts.posts.length - 1
									].createdAt,
								},
								// updateQuery: (
								// 	prev,
								// 	{ fetchMoreResult }
								// ): PostsQuery => {
								// 	if (!fetchMoreResult)
								// 		return prev as PostsQuery
								// 	return {
								// 		__typename: 'Query',
								// 		posts: {
								// 			__typename: 'PaginatedPosts',
								// 			hasMore: (
								// 				fetchMoreResult as PostsQuery
								// 			).posts.hasMore,
								// 			posts: [
								// 				...(prev as PostsQuery).posts
								// 					.posts,
								// 				...(
								// 					fetchMoreResult as PostsQuery
								// 				).posts.posts,
								// 			],
								// 		},
								// 	}
								// },
							})
						}}
						isLoading={loading}
						m='auto'
						my={8}
					>
						load more
					</Button>
				</Flex>
			) : null}
		</Layout>
	)
}
export default withApolloClient({ ssr: true })(Index)
