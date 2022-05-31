import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Post } from '../entities/Post'
import { Updoot } from '../entities/Updoot'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { MyContext } from '../types'

@InputType()
class PostInput {
	@Field()
	title: string
	@Field()
	text: string
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[]
	@Field()
	hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50)
	}

	@FieldResolver(() => User)
	OP(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.OPId)
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { req, updootLoader }: MyContext
	) {
		if (!req.session.userId) {
			return null
		}

		const updoot = await updootLoader.load({
			postId: post.id,
			userId: req.session.userId,
		})

		return updoot ? updoot.value : null
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const realValue =
			value === 1 || value === 4
				? 1
				: value === -1 || value === 3
				? -1
				: 0
		// let isUpdoot = value !== -1
		// let realValue = isUpdoot ? 1 : -1
		const { userId } = req.session

		const queryValue =
			value === 3 || value === 4 ? realValue : realValue * 2

		const updoot = await Updoot.findOne({ where: { postId, userId } })

		if (updoot && updoot.value !== realValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
					UPDATE updoot
					SET value = $1
					WHERE "postId" = $2 AND "userId" = $3
				`,
					[realValue, postId, userId]
				)
				await tm.query(
					`
					UPDATE post
					SET rank = rank + $1
					WHERE id = $2
				`,
					[queryValue, postId]
				)
			})
		} else if (!updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
					INSERT INTO updoot ("userId", "postId", value)
					VALUES ($1, $2, $3)
				`,
					[userId, postId, realValue]
				)
				await tm.query(
					`
					UPDATE post
					SET rank = rank + $1
					WHERE id = $2
				`,
					[realValue, postId]
				)
			})
		}

		//await Updoot.insert({ userId, postId, value: realValue })

		// getConnection().query(
		// 	`
		// 	START TRANSACTION;

		// 	INSERT INTO updoot ("userId", "postId", value)
		// 	VALUES (${userId}, ${postId}, ${realValue});

		// 	UPDATE post
		// 	SET rank = rank + ${realValue}
		// 	WHERE id = ${postId};

		// 	COMMIT;
		// `
		// )

		return true
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null,
		@Ctx() { req }: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit)
		const realLimitPlusOne = realLimit + 1

		const replacements: any[] = [realLimitPlusOne]

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)))
		}

		const posts = await getConnection().query(
			`
			SELECT p.*
			FROM post p
			${cursor ? `WHERE p."createdAt" < $2` : ''}
			ORDER BY p."createdAt" DESC
			LIMIT $1
		`,
			replacements
		)

		// const qb = getConnection()
		// 	.getRepository(Post)
		// 	.createQueryBuilder('p')
		// 	.innerJoinAndSelect('p."OP"', 'u', 'u.id = p."OPId"')
		// 	.orderBy('p."createdAt"', 'DESC')
		// 	.take(realLimitPlusOne)
		// if (cursor) {
		// 	qb.where('p."createdAt" < :cursor', {
		// 		cursor: new Date(parseInt(cursor)),
		// 	})
		// }

		// const posts = await qb.getMany()
		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		}
	}

	@Query(() => Post, { nullable: true })
	async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		// const post = await getConnection().query(
		// 	`
		// 	SELECT json_build_object(
		// 		'id', p.id,
		// 		'text', p.text,
		// 		'title', p.title,
		// 		'createdAt', p."createdAt",
		// 		'updatedAt', p."updatedAt",
		// 		'rank', p.rank,
		// 		'OPId', p."OPId",
		// 		'OP', json_build_object(
		// 			'id', u.id,
		// 			'username', u.username,
		// 			'email', u.email,
		// 			'createdAt', u."createdAt",
		// 			'updatedAt', u."updatedAt"
		// 			)
		// 	) "Post"
		// 	FROM post p
		// 	INNER JOIN public.user u ON u.id = p."OPId"
		// 	WHERE p.id = $1
		// `,
		// 	[id]
		// )
		// console.log(post[0])
		// return post[0]
		const post = await Post.findOne(id)
		// console.log(post)
		return post
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('input') input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({ ...input, OPId: req.session.userId }).save()
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg('id', () => Int) id: number,
		@Arg('title') title: string,
		@Arg('text') text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id AND "OPId" = :OPId', {
				id,
				OPId: req.session.userId,
			})
			.returning('*')
			.execute()

		return result.raw[0]
		// return await Post.update({ id, OPId: req.session.userId}, { title, text })
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id', () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		const post = await Post.findOne(id)
		if (!post) {
			return false
		}
		if (post.OPId !== req.session.userId) {
			throw new Error('Not authorized')
		}
		await Updoot.delete({ postId: id })
		await Post.delete({ id })
		return true
	}
}
