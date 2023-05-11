import { addMigration } from '../../lib/migrations';
import { upsertPermissions } from '../../../app/authorization/server/functions/upsertPermissions';

addMigration({
	version: 296,
	name: 'Upsert permissions',
	async up() {
		await upsertPermissions();
	}
})
