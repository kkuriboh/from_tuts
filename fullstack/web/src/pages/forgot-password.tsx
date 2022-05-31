import { Box, Button, Flex } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React, { useState } from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { withApolloClient } from '../utils/withApolloClient'

function ForgotPassword({}) {
	const [complete, setComplete] = useState(false)
	const [forgotPassord] = useForgotPasswordMutation()
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					await forgotPassord({ variables: values })
					setComplete(true)
				}}
			>
				{({ isSubmitting }) =>
					complete ? (
						<Box>we have sent you an email</Box>
					) : (
						<Form>
							<InputField
								name='email'
								placeholder='email'
								label='Email'
								type='email'
							/>
							<Flex>
								<Button
									mt={4}
									type='submit'
									backgroundColor='teal'
									color='white'
									isLoading={isSubmitting}
								>
									send reset link
								</Button>
							</Flex>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	)
}
export default withApolloClient({ ssr: false })(ForgotPassword)
