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

const MAX_FILE_SIZE_MBYTES = 10

addMigration({
	version: 297,
	name: 'Reindex uploaded files',
	async up() {
		try {
			const { mongo } = MongoInternals.defaultRemoteCollectionDriver();
			const messageModel = mongo.db.collection('rocketchat_message');

			const messages = await messageModel.find({ attachments: { $elemMatch: { type: 'file' }}}).toArray()

			console.log('start reindex messages, total', messages.length);
			for (let i = 0; i < messages.length; i++) {
				const message = messages[i]
				const attachments = message.attachments
				for (let j = 0; j < attachments.length; j++) {
					const attachment = attachments[j]
					if (!attachment.fileContent) {
						const titleLink = attachment?.title_link?.replace('/file-upload', '')
						const match = /^\/([^\/]+)\/(.*)/.exec(titleLink || '');
						if (match?.[1]) {
							const file = await Uploads.findOneById(match[1])
							const isFileTooLarge = (file?.size / 1024) / 1024 > MAX_FILE_SIZE_MBYTES
							if (file && !isFileTooLarge) {
								const fileBuffer = await getFileBufferPromise(file)
								if (fileBuffer) {
									const fileContent = await getContentParser(file.type, fileBuffer).parse()
									if (fileContent) {
										attachment.fileContent = fileContent
										await messageModel.updateOne({ _id: message._id }, { $set: { attachments }})
									}
								}
							}
						}
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	}
})
