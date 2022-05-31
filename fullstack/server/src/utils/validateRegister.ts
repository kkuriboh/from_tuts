import { UserPasswordInput } from './UserPasswordInput'
import { emailRegex } from '../constants'

export function validateRegister(options: UserPasswordInput) {
	if (emailRegex.test(options.email) === false) {
		return [
			{
				field: 'email',
				message: 'please insert a valid email',
			},
		]
	}
	if (options.username.length < 3) {
		return [
			{
				field: 'username',
				message: 'username must be at least 3 characters',
			},
		]
	}
	if (options.password.length < 5) {
		return [
			{
				field: 'password',
				message: 'password must be at least 5 characters',
			},
		]
	}
	if (options.password !== options.confirmPassword) {
		return [
			{
				field: 'confirmPassword',
				message: 'passwords must match',
			},
		]
	}
	if (options.username.includes('@')) {
		return [
			{
				field: 'username',
				message: 'username cannot contain @',
			},
		]
	}
	return null
}
