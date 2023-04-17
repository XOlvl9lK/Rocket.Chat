import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Messages } from '@rocket.chat/models';
import type { IMessage, IUser } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ui-contexts';

import { canDeleteMessageAsync } from '../../../authorization/server/functions/canDeleteMessage';
import { deleteMessage } from '../functions';

declare module '@rocket.chat/ui-contexts' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		deleteMessage({ _id }: Pick<IMessage, '_id'>): void;
		deleteMessages({ ids }: { ids: string[] }): void;
	}
}

Meteor.methods<ServerMethods>({
	async deleteMessage(message) {
		check(
			message,
			Match.ObjectIncluding({
				_id: String,
			}),
		);

		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteMessage',
			});
		}

		const originalMessage = await Messages.findOneById(message._id, {
			projection: {
				u: 1,
				rid: 1,
				file: 1,
				files: 1,
				ts: 1,
			},
		});

		if (!originalMessage || !(await canDeleteMessageAsync(uid, originalMessage))) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'deleteMessage',
				action: 'Delete_message',
			});
		}

		return deleteMessage(originalMessage, (await Meteor.userAsync()) as IUser);
	},

	async deleteMessages({ ids }) {
		console.log('delete messages call');
		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteMessages',
			});
		}

		const user = await Meteor.userAsync();
		const cursor = await Messages.findManyByIds(ids);

		const messages = await cursor.toArray()

		let canDeleteMessages = true;

		for (let i = 0; i < messages.length; i++) {
			if (!(await canDeleteMessageAsync(uid, messages[i]))) canDeleteMessages = false;
		}

		if (!messages.length || !canDeleteMessages) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'deleteMessages',
				action: 'Delete_message',
			});
		}

		await Promise.all(messages.map(message => deleteMessage(message, user as IUser)));
	}
});
