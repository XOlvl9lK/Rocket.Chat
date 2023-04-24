import React from 'react';
import { MessageRole, MessageRoles } from '@rocket.chat/fuselage';

type ChannelBadgeProps = {
	title?: string
}

export const ChannelBadge = ({ title }: ChannelBadgeProps) => {
	return (
		<MessageRoles>
			<MessageRole>{title}</MessageRole>
		</MessageRoles>
	);
};
