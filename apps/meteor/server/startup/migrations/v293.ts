import { addMigration } from '../../lib/migrations';
import { MongoInternals } from 'meteor/mongo';
import { upsertPermissions } from '../../../app/authorization/server/functions/upsertPermissions';

addMigration({
	version: 293,
	name: 'Add index on message attachment description',
	async up() {
		const { mongo } = MongoInternals.defaultRemoteCollectionDriver();
		const messages = mongo.db.collection('rocketchat_message');

		await messages.dropIndex('msg_text')

		await messages.createIndex({
			'attachments.description': 'text',
			msg: 'text'
		})
		await upsertPermissions();
	}
})
