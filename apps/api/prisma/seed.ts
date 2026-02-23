import { faker } from '@faker-js/faker';
import { PrismaClient, Role, Status } from '@prisma/client';
import { CommonUtility } from '../src/common/utility';

const prisma = new PrismaClient();

function generateSlug(title: string): string {
	return title
		.toLocaleLowerCase()
		.trim()
		.replace(/ /g, '-')
		.replace(/[^\w-]+/g, '');
}

async function main() {
	const users = await Promise.all(
		Array.from({ length: 10 }).map(async () => ({
			account: faker.internet.email(),
			password: await CommonUtility.hashPassword(
				faker.internet.password(),
			),
			username: faker.person.fullName(),
			role: faker.helpers.arrayElement([
				Role.manager,
				Role.admin,
				Role.staff,
			]),
			email: faker.internet.email(),
			status: faker.helpers.arrayElement([
				Status.active,
				Status.inactive,
			]),
		})),
	);
	await prisma.user.createMany({
		data: users,
	});

	console.log('Sedding Completed!');
}

main()
	.then(() => {
		prisma.$disconnect();
		process.exit(0);
	})
	.catch((e) => {
		prisma.$disconnect();
		console.error(e);
		process.exit(1);
	});
