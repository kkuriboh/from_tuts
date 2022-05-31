import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import Wrapper from '../components/Wrapper'
import InputField from '../components/InputField'
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { withApolloClient } from '../utils/withApolloClient'

function Register() {
	const router = useRouter()
	const [register] = useRegisterMutation()
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{
					email: '',
					username: '',
					password: '',
					confirmPassword: '',
				}}
				onSubmit={async (values, setErrors) => {
					const response = await register({
						variables: { options: values },
						update: (cache, { data }) => {
							cache.writeQuery<MeQuery>({
								query: MeDocument,
								data: {
									__typename: 'Query',
									me: data?.register.user,
								},
							})
							cache.evict({ fieldName: 'posts' })
						},
					})
					if (response.data?.register.errors) {
						setErrors.setErrors(
							toErrorMap(response.data.register.errors)
						)
					} else if (response.data?.register.user) {
						router.push('/')
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='username'
							placeholder='username'
							label='Username'
						/>
						<Box mt={4}>
							<InputField
								name='email'
								placeholder='email'
								label='Email'
							/>
						</Box>
						<Box mt={4}>
							<InputField
								name='password'
								placeholder='password'
								label='Password'
								type='password'
							/>
						</Box>
						<Box mt={4}>
							<InputField
								name='confirmPassword'
								placeholder='confirm password'
								label='Confirm password'
								type='password'
							/>
						</Box>
						<Button
							mt={4}
							type='submit'
							backgroundColor='teal'
							color='white'
							isLoading={isSubmitting}
						>
							register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	)
}
export default withApolloClient({ ssr: false })(Register)
