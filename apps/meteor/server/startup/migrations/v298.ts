import { addMigration } from '../../lib/migrations';
import { MongoInternals } from 'meteor/mongo';

addMigration({
	version: 298,
	name: 'Change message index',
	async up() {
		const { mongo } = MongoInternals.defaultRemoteCollectionDriver();
		const messages = mongo.db.collection('rocketchat_message');

		await messages.dropIndex('attachments.description_text_attachments.title_text_attachments.fileContent_text_msg_text')

		await messages.createIndex({
			'attachments.description': 'text',
			'attachments.title': 'text',
			'attachments.fileContent': 'text',
			msg: 'text'
		}, {
			default_language: 'russian'
		})
	}
})
