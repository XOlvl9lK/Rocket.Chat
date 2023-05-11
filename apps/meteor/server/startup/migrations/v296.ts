import { addMigration } from '../../lib/migrations';
import { upsertPermissions } from '/app/authorization/server/functions/upsertPermissions';

addMigration({
	version: 293,
	name: 'Add index on message attachment description',
	async up() {
		await upsertPermissions();
	}
})
