import { useCallback } from 'react'
import { selectedMessageStore } from '/client/views/room/providers/SelectedMessagesProvider';
import { useTranslation } from '@rocket.chat/ui-contexts';
import { call } from '/client/lib/utils/call';
import { Messages } from '/app/models';
import { dispatchToastMessage } from '/client/lib/toast';
import { imperativeModal } from '/client/lib/imperativeModal';
import GenericModal from '/client/components/GenericModal';

export const useDeleteSelectedMessages = () => {
	const t = useTranslation();

	return useCallback(() => {
		const selectedMessages = selectedMessageStore.getSelectedMessages()
		if (selectedMessages.length) {
			const ids = selectedMessages.map(message => message._id)
			const onConfirm = async () => {
				try {
					await call('deleteMessages', { ids });
					Messages.remove({ _id: { $in: ids } });
					selectedMessageStore.reset();
					imperativeModal.close();

					dispatchToastMessage({ type: 'success', message: t('Your_entry_has_been_deleted') });
				} catch (error) {
					dispatchToastMessage({ type: 'error', message: error });
				}
			}

			const onCloseModal = () => imperativeModal.close();

			imperativeModal.open({
				component: GenericModal,
				props: {
					title: t('Are_you_sure'),
					children: t('You_will_not_be_able_to_recover'),
					variant: 'danger',
					confirmText: t('Yes_delete_it'),
					onConfirm,
					onClose: onCloseModal,
					onCancel: onCloseModal,
				}
			})
		}
	}, [t])
}
