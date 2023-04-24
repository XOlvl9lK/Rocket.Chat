import type { IMessage } from '@rocket.chat/core-typings';
import {
	MessageHeader as FuselageMessageHeader,
	MessageName,
	MessageTimestamp,
	MessageUsername,
	MessageStatusPrivateIndicator,
	MessageNameContainer,
} from '@rocket.chat/fuselage';
import { useTranslation, useUser } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo, useMemo } from 'react';

import { getUserDisplayName } from '../../../lib/getUserDisplayName';
import { useFormatDateAndTime } from '../../hooks/useFormatDateAndTime';
import { useFormatTime } from '../../hooks/useFormatTime';
import { useUserData } from '../../hooks/useUserData';
import type { UserPresence } from '../../lib/presence';
import { useChat } from '../../views/room/contexts/ChatContext';
import StatusIndicators from './StatusIndicators';
import MessageRoles from './header/MessageRoles';
import { useMessageRoles } from './header/hooks/useMessageRoles';
import { useMessageListShowUsername, useMessageListShowRealName, useMessageListShowRoles } from './list/MessageListContext';
import { ChannelBadge } from './header/ChannelBadge';

type MessageHeaderProps = {
	message: IMessage;
	showChannel?: boolean
};

const MessageHeader = ({ message, showChannel }: MessageHeaderProps): ReactElement => {
	const t = useTranslation();
	const viewer = useUser()

	const formatTime = useFormatTime();
	const formatDateAndTime = useFormatDateAndTime();

	const showRealName = useMessageListShowRealName();
	const user: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const usernameAndRealNameAreSame = !user.name || user.username === user.name;
	const showUsername = useMessageListShowUsername() && showRealName && !usernameAndRealNameAreSame;

	const showRoles = useMessageListShowRoles();
	const roles = useMessageRoles(message.u._id, message.rid, showRoles);
	const shouldShowRolesList = roles.length > 0;

	const chat = useChat();

	const channelTitle = useMemo(() => {
		if (message?.r?.name) {
			return message.r.name;
		}
		if (message?.r?.usernames?.length) {
			return message.r.usernames.find(u => u !== viewer.username) || message.r.usernames[0];
		}
		return '';
	}, [message]);

	return (
		<FuselageMessageHeader>
			<MessageNameContainer>
				<MessageName
					{...(!showUsername && { 'data-qa-type': 'username' })}
					title={!showUsername && !usernameAndRealNameAreSame ? `@${user.username}` : undefined}
					data-username={user.username}
					{...(user.username !== undefined &&
						chat?.userCard && {
							onClick: chat?.userCard.open(message.u.username),
							style: { cursor: 'pointer' },
						})}
				>
					{message.alias || getUserDisplayName(user.name, user.username, showRealName)}
				</MessageName>
				{showUsername && (
					<>
						{' '}
						<MessageUsername
							data-username={user.username}
							data-qa-type='username'
							{...(user.username !== undefined &&
								chat?.userCard && {
									onClick: chat?.userCard.open(message.u.username),
									style: { cursor: 'pointer' },
								})}
						>
							@{user.username}
						</MessageUsername>
					</>
				)}
			</MessageNameContainer>

			{showChannel && <ChannelBadge title={channelTitle} />}
			{shouldShowRolesList && <MessageRoles roles={roles} isBot={message.bot} />}
			<MessageTimestamp title={formatDateAndTime(message.ts)}>{formatDateAndTime(message.ts)}</MessageTimestamp>
			{message.private && <MessageStatusPrivateIndicator>{t('Only_you_can_see_this_message')}</MessageStatusPrivateIndicator>}
			<StatusIndicators message={message} />
		</FuselageMessageHeader>
	);
};

export default memo(MessageHeader);
