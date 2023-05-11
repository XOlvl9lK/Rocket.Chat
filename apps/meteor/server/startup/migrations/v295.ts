import { addMigration } from '../../lib/migrations';

addMigration({
	version: 295,
	name: 'Reindex uploaded files',
	async up() {
		// noop
	}
})
