import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { COOKIE_NAME, __prod__ } from './constants'
import { User } from './entities/User'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import { createConnection } from 'typeorm'
import { Post } from './entities/Post'
import path from 'path'
import { Updoot } from './entities/Updoot'
import { createUserLoader } from './utils/createUserLoader'
import { createUpdootLoader } from './utils/createUpdootLoader'
import 'dotenv-safe/config'

async function main() {
	const conn = await createConnection({
		type: 'postgres',
		url: process.env.DATABASE_URL,
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, './migrations/*')],
		entities: [User, Post, Updoot],
	})

	const app = express()

	const RedisStore = connectRedis(session as any)
	const redis = new Redis(process.env.REDIS_URL)

	const corsOrigin = process.env.CORS_ORIGIN.split(',')
	app.use(
		cors({
			origin: corsOrigin,
			credentials: true,
		})
	)
	app.use(
		session({
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}) as any,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 1,
				httpOnly: true,
				sameSite: 'lax',
				secure: __prod__,
			},
			name: COOKIE_NAME,
			saveUninitialized: false,
			secret: process.env.SESSION_SECRET,
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			updootLoader: createUpdootLoader(),
		}),
	})

	await apolloServer.start()

	apolloServer.applyMiddleware({
		app,
		cors: false,
	})

	app.listen(parseInt(process.env.PORT), () => {
		console.log('🚀Server is up and running on port 4000')
	})
}
main().catch((err) => {
	console.error(err)
})
