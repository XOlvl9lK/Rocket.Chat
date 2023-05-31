import type { ReactElement, ReactNode } from 'react';
import { Box } from '@rocket.chat/fuselage';

const VideoConfMessageFooterButtons = ({ children, ...props }: { children: ReactNode }): ReactElement => (
	<Box mi='neg-x4' display='flex' alignItems='center' {...props}>
		{children}
	</Box>
);

export default VideoConfMessageFooterButtons;
