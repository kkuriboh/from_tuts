import { Button } from '@chakra-ui/button'
import { Box, Flex, Link } from '@chakra-ui/layout'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import InputField from '../../components/InputField'
import Wrapper from '../../components/Wrapper'
import {
	MeDocument,
	MeQuery,
	useChangePasswordMutation,
} from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'
import { withApolloClient } from '../../utils/withApolloClient'

const ChangePassword: NextPage = () => {
	const router = useRouter()
	const [changePassword] = useChangePasswordMutation()
	const [tokenError, setTokenError] = useState('')
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ newPassword: '', confirmPassword: '' }}
				onSubmit={async (values, setErrors) => {
					const response = await changePassword({
						variables: {
							newPassword: values.newPassword,
							confirmPassword: values.confirmPassword,
							token:
								typeof router.query.token === 'string'
									? router.query.token
									: '',
						},
						update: (cache, { data }) => {
							cache.writeQuery<MeQuery>({
								query: MeDocument,
								data: {
									__typename: 'Query',
									me: data?.changePassword.user,
								},
							})
						},
					})
					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(
							response.data.changePassword.errors
						)
						if ('token' in errorMap) {
							setTokenError(errorMap.token)
						}
					} else if (response.data?.changePassword.user) {
						router.push('/')
					}
				}}
			>
				{tokenError === 'token expired' ? (
					<div>404 not found</div>
				) : (
					({ isSubmitting }) => (
						<Form>
							<InputField
								name='newPassword'
								placeholder='new password'
								label='New password'
								type='password'
							/>
							<Box mt={4}>
								<InputField
									name='confirmPassword'
									placeholder='confirm password'
									label='Confirm password'
									type='password'
								/>
							</Box>
							{tokenError ? (
								<Flex>
									<Box mr={4} color='red'>
										{tokenError}
									</Box>
									<NextLink href='/forgot-password'>
										<Link>Go, foget it again</Link>
									</NextLink>
								</Flex>
							) : null}
							<Button
								mt={4}
								type='submit'
								backgroundColor='teal'
								color='white'
								isLoading={isSubmitting}
							>
								change password
							</Button>
						</Form>
					)
				)}
			</Formik>
		</Wrapper>
	)
}
export default withApolloClient({ ssr: false })(ChangePassword)
