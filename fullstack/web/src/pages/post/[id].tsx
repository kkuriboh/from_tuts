import { Heading } from '@chakra-ui/layout'
import Layout from '../../components/Layout'
import PostStateButtons from '../../components/PostStateButtons'
import { getPostFromUrl } from '../../utils/getPostFromUrl'
import { withApolloClient } from '../../utils/withApolloClient'

function Post({}) {
	const { data, loading, error } = getPostFromUrl()
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
		<Layout>
			<Heading mb={4}>{data.post.title}</Heading>
			{data.post.text}
			<PostStateButtons id={data.post.id} OPId={data.post.OP.id} />
		</Layout>
	)
}
export default withApolloClient({ ssr: true })(Post)
