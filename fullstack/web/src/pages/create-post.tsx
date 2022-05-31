import { Box, Button, Flex } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import InputField from '../components/InputField'
import Layout from '../components/Layout'
import { useCreatePostMutation } from '../generated/graphql'
import { useIsAuth } from '../utils/useIsAuth'
import { withApolloClient } from '../utils/withApolloClient'

function CreatePost() {
	const router = useRouter()
	useIsAuth()
	const [createPost] = useCreatePostMutation()
	return (
		<Layout variant='small'>
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values) => {
					const { errors } = await createPost({
						variables: { createPostInput: values },
						update: (cache) => {
							cache.evict({ fieldName: 'posts' })
						},
					})
					if (errors) {
						router.push('/')
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='title'
							placeholder='title'
							label='Title'
						/>
						<Box mt={4}>
							<InputField
								name='text'
								placeholder='text...'
								label='Body'
								textArea
							/>
						</Box>
						<Flex>
							<Button
								mt={4}
								type='submit'
								backgroundColor='teal'
								color='white'
								isLoading={isSubmitting}
							>
								create post
							</Button>
						</Flex>
					</Form>
				)}
			</Formik>
		</Layout>
	)
}
export default withApolloClient({ ssr: false })(CreatePost)
