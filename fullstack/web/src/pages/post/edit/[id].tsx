import { Box } from '@chakra-ui/layout'
import { Button, Flex } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import InputField from '../../../components/InputField'
import Layout from '../../../components/Layout'
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql'
import { getIntId } from '../../../utils/getIntId'
import { withApolloClient } from '../../../utils/withApolloClient'

function EditPost() {
	const router = useRouter()
	const id = getIntId()
	const { data, loading, error } = usePostQuery({
		skip: id === -1,
		variables: {
			id,
		},
	})
	const [updatePost] = useUpdatePostMutation()
	if (loading) {
		return (
			<Layout>
				<div>loading...</div>
			</Layout>
		)
	}
	if (error) {
		return <div>{error.message}</div>
	}
	if (!data?.post) {
		return <h1>could not find post</h1>
	}
	return (
		<Layout variant='small'>
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					await updatePost({ variables: { id, ...values } })
					router.back()
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
export default withApolloClient({ ssr: false })(EditPost)
