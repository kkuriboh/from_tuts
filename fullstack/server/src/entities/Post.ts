import { Field, Int, ObjectType } from 'type-graphql'
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Updoot } from './Updoot'
import { User } from './User'

@ObjectType()
@Entity()
export class Post extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number

	@Field(() => String)
	@CreateDateColumn()
	createdAt = Date()

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt = Date()

	@Field(() => Int, { nullable: true })
	voteStatus: number | null

	@Field()
	@Column()
	title!: string

	@Field()
	@Column()
	text!: string

	@Field()
	@Column({ type: 'int', default: 0 })
	rank!: number

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.posts)
	OP: User

	@OneToMany(() => Updoot, (updoot) => updoot.post)
	updoots: Updoot[]

	@Field()
	@Column()
	OPId: number
}
