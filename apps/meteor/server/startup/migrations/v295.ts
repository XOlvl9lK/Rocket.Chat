import { addMigration } from '../../lib/migrations';
import { MongoInternals } from 'meteor/mongo';
import { getContentParser } from '/app/api/server/lib/contentParser';
import { FileUpload } from '/app/file-upload/server';
import type { IUpload } from '@rocket.chat/core-typings';
import { Uploads } from '@rocket.chat/models';

const getFileBufferPromise = (file: IUpload) => {
	return new Promise<Buffer>((resolve, reject) => {
		FileUpload.getBuffer(file, (e, data) => {
			if (e) reject(e)
			resolve(data)
		})
	})
}

addMigration({
	version: 295,
	name: 'Reindex uploaded files',
	async up() {
		const { mongo } = MongoInternals.defaultRemoteCollectionDriver();
		const messageModel = mongo.db.collection('rocketchat_message');

		const messages = await messageModel.find({ attachments: { $elemMatch: { type: 'file' }}}).toArray()

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i]
			const attachments = message.attachments
			for (let j = 0; j < attachments; j++) {
				const attachment = attachments[j]
				const titleLink = attachment?.title_link?.replace('/file-upload/', '')
				const match = /^\/([^\/]+)\/(.*)/.exec(titleLink || '');
				if (match?.[1]) {
					const file = await Uploads.findOneById(match[1])
					if (file) {
						const fileBuffer = await getFileBufferPromise(file)
						if (fileBuffer) {
							attachment.fileContent = await getContentParser(file.type, fileBuffer).parse()
							await messageModel.updateOne({ _id: message._id }, { $set: { attachments }})
						}
					}
				}
			}
		}
	}
})
