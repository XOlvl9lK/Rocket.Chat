import { addMigration } from '../../lib/migrations';
import { upsertPermissions } from '/app/authorization/server/functions/upsertPermissions';

addMigration({
	version: 299,
	name: 'Upsert permissions',
	async up() {
		await upsertPermissions();
	}
})
