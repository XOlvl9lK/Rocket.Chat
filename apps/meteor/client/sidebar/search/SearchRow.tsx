import React, { useRef, useMemo } from 'react';
import type { IMessage } from '@rocket.chat/core-typings';
import { useUserId } from '@rocket.chat/ui-contexts';
import { useIsMessageHighlight } from '/client/views/room/MessageList/contexts/MessageHighlightContext';
import { useToggle } from '@rocket.chat/fuselage-hooks';
import { useChat } from '/client/views/room/contexts/ChatContext';
import {
	useCountSelected,
	useIsSelectedMessage,
	useIsSelecting,
	useToggleSelect,
} from '/client/views/room/MessageList/contexts/SelectedMessagesContext';
import { useJumpToMessage } from '/client/views/room/MessageList/hooks/useJumpToMessage';
import { Message, MessageLeftContainer, MessageContainer, CheckBox } from '@rocket.chat/fuselage';
import UserAvatar from '/client/components/avatar/UserAvatar';
import IgnoredContent from '/client/components/message/IgnoredContent';
import RoomMessageContent from '/client/components/message/variants/room/RoomMessageContent';
import { MessageAction } from '/app/ui-utils/client';
import MessageHeader from '/client/components/message/MessageHeader';

type RoomMessageProps = {
	message: IMessage & { ignored?: boolean };
	showUserAvatar: boolean;
	searchText?: string;
};

const SearchRow = ({ message, showUserAvatar, searchText }: RoomMessageProps) => {
	const uid = useUserId();
	const editing = useIsMessageHighlight(message._id);
	const [displayIgnoredMessage, toggleDisplayIgnoredMessage] = useToggle(false);
	const ignored = (message.ignored) && !displayIgnoredMessage;
	const chat = useChat();
	const messageRef = useRef(null);

	const selecting = useIsSelecting();
	const selected = useIsSelectedMessage(message._id);

	useCountSelected();

	useJumpToMessage(message._id, messageRef);

	const jumpToSearchMessageAction = useMemo(() => MessageAction.getButtonById('jump-to-search-message'), []);

	return (
		<Message
			ref={messageRef}
			id={message._id}
			onClick={(e) => jumpToSearchMessageAction.action(e, { message })}
			isSelected={selected}
			isEditing={editing}
			isPending={message.temp}
			sequential={false}
			data-qa-editing={editing}
			data-qa-selected={selected}
			data-id={message._id}
			data-mid={message._id}
			data-unread={false}
			data-sequential={false}
			data-own={message.u._id === uid}
			data-qa-type='message'
			aria-busy={message.temp}
		>
			<MessageLeftContainer>
				{message.u.username && !selecting && showUserAvatar && (
					<UserAvatar
						url={message.avatar}
						username={message.u.username}
						size='x36'
						{...(chat?.userCard && {
							onClick: chat?.userCard.open(message.u.username),
							style: { cursor: 'pointer' },
						})}
					/>
				)}
			</MessageLeftContainer>

			<MessageContainer>
				<MessageHeader message={message} />

				{ignored ? (
					<IgnoredContent onShowMessageIgnored={toggleDisplayIgnoredMessage} />
				) : (
					<RoomMessageContent message={message} unread={false} mention={false} all={false} searchText={searchText} />
				)}
			</MessageContainer>
		</Message>
	);
};

export default SearchRow;
