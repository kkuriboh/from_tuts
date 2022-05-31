import { withApollo } from 'next-apollo'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { PaginatedPosts } from '../generated/graphql'
import { NextPageContext } from 'next'

const createClient = (ctx: NextPageContext) =>
	new ApolloClient({
		uri: 'http://localhost:4000/graphql',
		credentials: 'include',
		headers: {
			cookie:
				(typeof window === 'undefined'
					? ctx.req?.headers.cookie
					: undefined) || '',
		},
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						posts: {
							keyArgs: [],
							merge(
								existing: PaginatedPosts | undefined,
								incoming: PaginatedPosts
							) {
								return {
									...incoming,
									posts: [
										...(existing?.posts || []),
										...incoming.posts,
									],
								}
							},
						},
					},
				},
			},
		}),
	})

export const withApolloClient = withApollo(createClient)
