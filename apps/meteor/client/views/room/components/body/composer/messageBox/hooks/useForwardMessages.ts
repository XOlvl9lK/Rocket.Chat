import { useCallback } from 'react';
import { imperativeModal } from '/client/lib/imperativeModal';
import ShareMessageModal from '/client/views/room/modals/ShareMessageModal/ShareMessageModal';
import { MessageAction } from '/app/ui-utils/client';
import { selectedMessageStore } from '/client/views/room/providers/SelectedMessagesProvider';

export const useForwardMessages = () => {
	return useCallback(async () => {
		const selectedMessages = selectedMessageStore.getSelectedMessages()
		if (selectedMessages.length) {
			const permalink = await MessageAction.getPermaLink(selectedMessages[0]._id);

			imperativeModal.open({
				component: ShareMessageModal,
				props: {
					messages: selectedMessages,
					permalink,
					onClose: (): void => {
						imperativeModal.close();
					},
					onSuccess() {
						selectedMessageStore.reset()
					},
					enableCopy: false,
				}
			})
		}
	}, [])
}
