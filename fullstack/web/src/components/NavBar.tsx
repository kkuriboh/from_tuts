import { Box, Flex, Link } from '@chakra-ui/layout'
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { Button } from '@chakra-ui/button'
import isServer from '../utils/isServer'
import { Heading } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useApolloClient } from '@apollo/client'

export default function NavBar() {
	const [logout, { loading: logoutFetching }] = useLogoutMutation()
	const { data, loading } = useMeQuery({
		skip: isServer(),
	})
	const apolloClient = useApolloClient()
	let body = null

	if (loading) {
		body = null
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link mr={4}>login</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link>register</Link>
				</NextLink>
			</>
		)
	} else {
		body = (
			<Flex align='center'>
				<NextLink href='create-post'>
					<Button as={Link} mr={4}>
						create post
					</Button>
				</NextLink>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					variant='link'
					onClick={async () => {
						await logout()
						await apolloClient.resetStore()
					}}
					isLoading={logoutFetching}
				>
					logout
				</Button>
			</Flex>
		)
	}

	return (
		<Flex
			align='center'
			position='sticky'
			top={0}
			zIndex={1}
			bg='tan'
			p={4}
			ml='auto'
		>
			<Flex flex={1} m='auto' maxW={800} align='center'>
				<NextLink href='/'>
					<Link>
						<Heading>Forum</Heading>
					</Link>
				</NextLink>
				<Box ml='auto'>{body}</Box>
			</Flex>
		</Flex>
	)
}
