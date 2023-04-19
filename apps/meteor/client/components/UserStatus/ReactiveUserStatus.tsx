import type { IUser } from '@rocket.chat/core-typings';
import { UserStatus } from '@rocket.chat/ui-client';
import type { ComponentProps, ReactElement } from 'react';
import React, { memo } from 'react';
import { usePresence } from '../../hooks/usePresence';
import { Icon } from '@rocket.chat/fuselage';

type ReactiveUserStatusProps = {
	uid: IUser['_id'];
} & ComponentProps<typeof UserStatus.UserStatus>;

const ReactiveUserStatus = ({ uid, ...props }: ReactiveUserStatusProps): ReactElement => {
	const presence = usePresence(uid);

	const status = presence?.status;
	const isOnCall = presence?.isOnCall;

	if (isOnCall && status !== 'offline') {
		return <Icon name='phone' size='x16' />;
	}

	return <UserStatus.UserStatus status={status} {...props} />;
};

export default memo(ReactiveUserStatus);
