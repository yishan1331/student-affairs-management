import * as readline from 'readline';
import * as fs from 'fs';

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

const prisma = new PrismaClient();

type ParsedRecord = {
	ymd: string;
	weightKg: number;
	source: string;
};

const LB_TO_KG = 0.45359237;
const ATTR = (line: string, name: string) =>
	new RegExp(`${name}="([^"]+)"`).exec(line)?.[1];

function parseArgs() {
	const args = process.argv.slice(2);
	const getArg = (name: string) =>
		args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
	return {
		userId: Number(getArg('user')),
		filePath: getArg('file'),
		petId: getArg('pet') ? Number(getArg('pet')) : null,
		overwrite: args.includes('--overwrite'),
		dryRun: args.includes('--dry-run'),
	};
}

async function parseExport(filePath: string): Promise<ParsedRecord[]> {
	const rl = readline.createInterface({
		input: fs.createReadStream(filePath, { encoding: 'utf8' }),
		crlfDelay: Infinity,
	});

	const byDate = new Map<string, ParsedRecord>();
	let scanned = 0;
	let matched = 0;

	for await (const line of rl) {
		scanned++;
		if (!line.includes('HKQuantityTypeIdentifierBodyMass')) continue;

		const startDate = ATTR(line, 'startDate');
		const unit = ATTR(line, 'unit');
		const rawValue = ATTR(line, 'value');
		const source = ATTR(line, 'sourceName') ?? '';
		if (!startDate || !rawValue) continue;

		const ymd = startDate.slice(0, 10);
		if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) continue;

		const value = Number(rawValue);
		if (!Number.isFinite(value) || value <= 0) continue;

		let weightKg: number;
		if (unit === 'kg') weightKg = value;
		else if (unit === 'lb') weightKg = value * LB_TO_KG;
		else continue;

		matched++;
		// 同日多筆：保留最後一筆（通常是一天內最新的紀錄）
		byDate.set(ymd, { ymd, weightKg, source });
	}

	console.log(`掃描 ${scanned} 行，命中體重紀錄 ${matched} 筆，去重後 ${byDate.size} 天`);
	return [...byDate.values()].sort((a, b) => a.ymd.localeCompare(b.ymd));
}

async function run() {
	const { userId, filePath, petId, overwrite, dryRun } = parseArgs();

	if (!userId || !filePath) {
		console.error(
			'用法: npm run import:apple-health -- --user=<userId> --file=<path/to/export.xml> [--pet=<petId>] [--overwrite] [--dry-run]',
		);
		process.exit(1);
	}
	if (!fs.existsSync(filePath)) {
		console.error(`找不到檔案: ${filePath}`);
		process.exit(1);
	}

	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) {
		console.error(`找不到 user_id=${userId}`);
		process.exit(1);
	}
	if (petId) {
		const pet = await prisma.pet.findUnique({ where: { id: petId } });
		if (!pet) {
			console.error(`找不到 pet_id=${petId}`);
			process.exit(1);
		}
	}

	console.log(
		`目標：user=${user.username}(${userId})${petId ? ` pet=${petId}` : ''}，模式=${dryRun ? 'dry-run' : overwrite ? 'overwrite' : 'skip-existing'}`,
	);

	const records = await parseExport(filePath);
	if (records.length === 0) {
		console.log('沒有可匯入的體重資料');
		return;
	}
	console.log(
		`時間範圍：${records[0].ymd} ~ ${records[records.length - 1].ymd}`,
	);

	const dateObjs = records.map((r) => new Date(`${r.ymd}T00:00:00.000Z`));
	const existingRows = await prisma.healthWeight.findMany({
		where: { user_id: userId, pet_id: petId, date: { in: dateObjs } },
		select: { id: true, date: true },
	});
	const existingByYmd = new Map<string, number>(
		existingRows.map((e) => [e.date.toISOString().slice(0, 10), e.id]),
	);
	console.log(`資料庫已存在 ${existingByYmd.size} 天的紀錄`);

	let created = 0;
	let updated = 0;
	let skipped = 0;

	for (const r of records) {
		const existingId = existingByYmd.get(r.ymd);

		if (existingId && !overwrite) {
			skipped++;
			continue;
		}

		const weight = Math.round(r.weightKg * 100) / 100;
		const note = `Apple Health 匯入（${r.source || 'unknown'}）`;
		const normalizedDate = new Date(`${r.ymd}T00:00:00.000Z`);

		if (dryRun) {
			existingId ? updated++ : created++;
			continue;
		}

		if (existingId) {
			await prisma.healthWeight.update({
				where: { id: existingId },
				data: { weight, note, modifier_id: userId },
			});
			updated++;
		} else {
			await prisma.healthWeight.create({
				data: {
					user_id: userId,
					pet_id: petId,
					date: normalizedDate,
					weight,
					note,
				},
			});
			created++;
		}

		if ((created + updated) % 100 === 0) {
			console.log(
				`進度：+${created} / ~${updated} / 略過 ${skipped} / 總 ${records.length}`,
			);
		}
	}

	console.log('----');
	console.log(
		`完成：新增 ${created}、更新 ${updated}、略過 ${skipped}${dryRun ? '（dry-run 未寫入）' : ''}`,
	);
}

run()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
