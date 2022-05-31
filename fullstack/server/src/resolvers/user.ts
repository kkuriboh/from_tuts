import argon2 from 'argon2'
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql'
import { v4 } from 'uuid'
import { COOKIE_NAME, emailRegex, FORGET_PASSWORD_PREFIX } from '../constants'
import { User } from '../entities/User'
import { MyContext } from '../types'
import { sendEmail } from '../utils/sendEmail'
import { UserPasswordInput } from '../utils/UserPasswordInput'
import { validateRegister } from '../utils/validateRegister'

@ObjectType()
class FieldError {
	@Field()
	field: string
	@Field()
	message: string
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]
	@Field(() => User, { nullable: true })
	user?: User
}

@Resolver(User)
export class UserResolver {
	@FieldResolver(() => String)
	email(@Root() user: User, @Ctx() { req }: MyContext) {
		if (req.session.userId === user.id) {
			return user.email
		}
		return ''
	}

	@Mutation(() => UserResponse)
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string,
		@Arg('confirmPassword') confirmPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword !== confirmPassword) {
			return {
				errors: [
					{
						field: 'confirmPassword',
						message: 'passwords do not match',
					},
				],
			}
		}
		if (newPassword.length <= 5) {
			return {
				errors: [
					{
						field: 'password',
						message: 'password must be at least 5 characters',
					},
				],
			}
		}

		const key = FORGET_PASSWORD_PREFIX + token
		const userId = await redis.get(key)

		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'token expired',
					},
				],
			}
		}

		const userIdNum = parseInt(userId)
		const user = await User.findOne(userIdNum)

		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'user no longer exists',
					},
				],
			}
		}

		await User.update(
			{ id: userIdNum },
			{ password: await argon2.hash(newPassword) }
		)

		await redis.del(key)

		return { user }
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg('email') email: string,
		@Ctx() { redis }: MyContext
	) {
		const user = await User.findOne({ where: { email } })

		if (!user) {
			return false
		}

		const token = v4()
		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			1000 * 60 * 30
		) // 30 minutes
		const a = await sendEmail(
			email,
			`<a href="localhost:3000/change-password/${token}">change password</a>`
		).catch((err) => console.log(err))
		console.log(a)
		return true
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		if (!req.session.userId) {
			return null
		}

		return User.findOne(req.session.userId)
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options') options: UserPasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(options)
		if (errors) return { errors }

		const hashedPassword = await argon2.hash(options.password)
		let user
		try {
			user = await User.create({
				username: options.username,
				email: options.email,
				password: hashedPassword,
			}).save()
		} catch (err) {
			if (err.detail.includes('already exists')) {
				return {
					errors: [
						{
							field: 'username',
							message: 'username already taken',
						},
					],
				}
			}
		}
		req.session.userId = user?.id
		return { user }
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('usernameOrEmail') useNameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			emailRegex.test(useNameOrEmail)
				? { where: { email: useNameOrEmail } }
				: { where: { username: useNameOrEmail } }
		)
		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: 'username not found',
					},
				],
			}
		}
		const valid = await argon2.verify(user.password, password)
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: 'invalid password',
					},
				],
			}
		}

		req.session.userId = user.id

		return {
			user,
		}
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) => {
			req.session.destroy((err: any) => {
				res.clearCookie(COOKIE_NAME)
				if (err) {
					resolve(false)
					return
				}
				resolve(true)
			})
		})
	}
}
