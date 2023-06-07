import { useSetModal } from '@rocket.chat/ui-contexts';
import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import VideoConfBlockModal from '../VideoConfBlockModal';
import { useAmIOnCall } from './useAmIOnCall';
import { useUser } from '@rocket.chat/ui-contexts';

type WindowMaybeDesktop = typeof window & {
	RocketChatDesktop?: {
		openInternalVideoChatWindow?: (url: string, userId?: string, callId?: string) => void;
	};
};

export const useVideoOpenCall = () => {
	const setModal = useSetModal();
	const user = useUser()
	const { onCall, offCall } = useAmIOnCall()

	const handleOpenCall = useCallback(
		async (callUrl: string, callId: string) => {
			const windowMaybeDesktop = window as WindowMaybeDesktop;
			const videoChatWindowId = uuidv4()
			if (windowMaybeDesktop.RocketChatDesktop?.openInternalVideoChatWindow) {
				windowMaybeDesktop.RocketChatDesktop.openInternalVideoChatWindow(callUrl, user?._id, callId);
			} else {
				const open = () => window.open(callUrl);
				const popup = open();

				if (popup !== null) {
					onCall(videoChatWindowId, callId);
					const interval = setInterval(() => {
						if (popup.closed) {
							offCall(videoChatWindowId, callId);
							clearInterval(interval);
						}
					}, 3000);
					return;
				}

				setModal(<VideoConfBlockModal onClose={(): void => setModal(null)} onConfirm={open} />);
			}
		},
		[setModal, user, offCall, onCall],
	);

	return handleOpenCall;
};
