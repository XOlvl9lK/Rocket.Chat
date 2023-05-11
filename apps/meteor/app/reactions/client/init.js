import { Meteor } from 'meteor/meteor';

import { MessageAction } from '../../ui-utils/client';
import { messageArgs } from '../../../client/lib/utils/messageArgs';
import { EmojiPicker } from '../../emoji/client';
import { roomCoordinator } from '../../../client/lib/rooms/roomCoordinator';
import { createTemplateForComponent } from '/client/lib/portals/createTemplateForComponent';
import { HTML } from 'meteor/htmljs';

Meteor.startup(function () {
	createTemplateForComponent('EmojiPickerWrapper', () => import('../../../client/views/composer/EmojiPickerWrapper'), {
		renderContainerView: () => HTML.DIV({ class: 'emoji-picker rc-popover__content' }),
	});

	MessageAction.addButton({
		id: 'reaction-message',
		icon: 'add-reaction',
		label: 'Add_Reaction',
		context: ['message', 'message-mobile', 'threads', 'federated'],
		action(event, props) {
			event.stopPropagation();
			const { message = messageArgs(this).msg } = props;
			EmojiPicker.open(event.currentTarget, (emoji) => Meteor.call('setReaction', `:${emoji}:`, message._id));
		},
		condition({ message, user, room, subscription }) {
			if (!room) {
				return false;
			}

			if (!subscription) {
				return false;
			}

			if (message.private) {
				return false;
			}

			if (roomCoordinator.readOnly(room._id, user) && !room.reactWhenReadOnly) {
				return false;
			}
			const isLivechatRoom = roomCoordinator.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}

			return true;
		},
		order: -2,
		group: ['message', 'menu'],
	});
});
