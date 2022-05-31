import { InputType, Field } from 'type-graphql'

@InputType()
export class UserPasswordInput {
	@Field()
	password: string
	@Field()
	confirmPassword: string
	@Field()
	username: string
	@Field()
	email: string
}
