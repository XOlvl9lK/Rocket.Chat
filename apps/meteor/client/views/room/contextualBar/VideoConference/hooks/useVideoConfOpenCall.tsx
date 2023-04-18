import { useSetModal } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import VideoConfBlockModal from '../VideoConfBlockModal';
import { useAmIOnCall } from './useAmIOnCall';

type WindowMaybeDesktop = typeof window & {
	RocketChatDesktop?: {
		openInternalVideoChatWindow?: (url: string, options?: { onClose?: () => void }) => void;
	};
};

export const useVideoOpenCall = () => {
	const setModal = useSetModal();
	const trigger = useAmIOnCall()

	const handleOpenCall = useCallback(
		(callUrl: string) => {
			const windowMaybeDesktop = window as WindowMaybeDesktop;
			const videoChatWindowId = uuidv4()
			if (windowMaybeDesktop.RocketChatDesktop?.openInternalVideoChatWindow) {
				const reset = trigger(videoChatWindowId)
				windowMaybeDesktop.RocketChatDesktop.openInternalVideoChatWindow(callUrl, { onClose: reset });
			} else {
				const open = () => window.open(callUrl);
				const popup = open();

				if (popup !== null) {
					const reset = trigger(videoChatWindowId);
					const interval = setInterval(() => {
						if (popup.closed) {
							reset();
							clearInterval(interval);
						}
					}, 3000);
					return;
				}

				setModal(<VideoConfBlockModal onClose={(): void => setModal(null)} onConfirm={open} />);
			}
		},
		[setModal],
	);

	return handleOpenCall;
};
