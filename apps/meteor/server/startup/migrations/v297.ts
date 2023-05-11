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
	version: 297,
	name: 'Reindex uploaded files',
	async up() {
		const { mongo } = MongoInternals.defaultRemoteCollectionDriver();
		const messageModel = mongo.db.collection('rocketchat_message');

		const messages = await messageModel.find({ attachments: { $elemMatch: { type: 'file' }}}).toArray()

		console.log('start reindex messages, total', messages.length);
		for (let i = 0; i < messages.length; i++) {
			const message = messages[i]
			console.log('message', message._id);
			const attachments = message.attachments
			for (let j = 0; j < attachments; j++) {
				const attachment = attachments[j]
				const titleLink = attachment?.title_link?.replace('/file-upload', '')
				console.log('titleLink', titleLink);
				const match = /^\/([^\/]+)\/(.*)/.exec(titleLink || '');
				if (match?.[1]) {
					const file = await Uploads.findOneById(match[1])
					console.log('file id', file?._id);
					if (file) {
						const fileBuffer = await getFileBufferPromise(file)
						if (fileBuffer) {
							console.log('is buffer found', !!fileBuffer);
							attachment.fileContent = await getContentParser(file.type, fileBuffer).parse()
							console.log('content parsed');
							await messageModel.updateOne({ _id: message._id }, { $set: { attachments }})
						}
					}
				}
			}
		}
	}
})
