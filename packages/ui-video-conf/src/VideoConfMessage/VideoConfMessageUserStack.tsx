import type { IVideoConferenceUser, Serialized } from '@rocket.chat/core-typings';
import { Avatar, Box } from '@rocket.chat/fuselage';
import { useUserAvatarPath } from '@rocket.chat/ui-contexts';
import { ReactElement, memo } from 'react';

const MAX_USERS = 6;

const VideoConfMessageUserStack = ({ users }: { users: Serialized<IVideoConferenceUser>[] }): ReactElement => {
	const getUserAvatarPath = useUserAvatarPath();

	return (
		<Box>
			<Box display='flex' alignItems='center'>
				{users.slice(0, MAX_USERS).map(({ username }, index) => (
					<Box key={index} title={username}>
						<Avatar size='x28' url={getUserAvatarPath(username as string)} />
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default memo(VideoConfMessageUserStack);
