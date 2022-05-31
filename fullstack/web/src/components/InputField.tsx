import {
	FormControl,
	FormLabel,
	FormErrorMessage,
} from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Textarea } from '@chakra-ui/textarea'
import { useField } from 'formik'
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string
	label: string
	textArea?: boolean
}

export default function InputField({
	label,
	textArea,
	size: _,
	...props
}: InputFieldProps) {
	const Component: any = textArea ? Textarea : Input
	const [field, { error }] = useField(props)
	return (
		<FormControl isInvalid={!!error}>
			<FormLabel htmlFor={props.name}>{label}</FormLabel>
			<Component
				{...field}
				{...props}
				id={field.name}
				placeholder={props.placeholder}
			/>
			{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
		</FormControl>
	)
}
