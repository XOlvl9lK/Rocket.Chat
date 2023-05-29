import type { IUser } from '@rocket.chat/core-typings';
import { UserStatus } from '@rocket.chat/ui-client';
import type { ComponentProps, ReactElement } from 'react';
import React, { memo, useMemo } from 'react';
import { usePresence } from '../../hooks/usePresence';
import { Icon } from '@rocket.chat/fuselage';
import { detectEmoji } from '/client/lib/utils/detectEmoji';

type ReactiveUserStatusProps = {
	uid: IUser['_id'];
} & ComponentProps<typeof UserStatus.UserStatus>;

const ReactiveUserStatus = ({ uid, ...props }: ReactiveUserStatusProps): ReactElement => {
	const presence = usePresence(uid);

	const statusText = presence?.statusText
	const status = presence?.status;
	const isOnCall = presence?.isOnCall;
	const statusEmoji = presence?.statusEmoji

	const [emojiResult] = useMemo(() => {
		if (!statusEmoji) return []
		return detectEmoji(statusEmoji)
	}, [statusEmoji])

	if (isOnCall && status !== 'offline') {
		return <Icon name='phone' size='x16' />;
	}

	return <UserStatus.UserStatus status={status} statusText={statusText} statusEmoji={emojiResult} {...props} />;
};

export default memo(ReactiveUserStatus);
