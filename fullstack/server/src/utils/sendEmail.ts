'use strict'
import nodemailer from 'nodemailer'

export async function sendEmail(to: string, html: string) {
	const transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: 'govogniwv4ilrthn@ethereal.email',
			pass: 'uDtPadmpqPYmqZNC9M',
		},
	})

	const info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>',
		to,
		subject: 'Change password',
		html,
	})

	console.log('Message sent: %s', info.messageId)
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
