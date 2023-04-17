import React, { useCallback } from 'react';
import { useForwardMessages } from '/client/views/room/components/body/composer/messageBox/hooks/useForwardMessages';
import { selectedMessageStore } from '/client/views/room/providers/SelectedMessagesProvider';
import { Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useTranslation, useUser } from '@rocket.chat/ui-contexts';
import {
	useCanDeleteSelectedMessages,
	useCountSelected,
} from '/client/views/room/MessageList/contexts/SelectedMessagesContext';
import {
	useDeleteSelectedMessages
} from './hooks/useDeleteSelectedMessages';

const SelectedMessagesActions = () => {
	const t = useTranslation();
	const forwardMessages = useForwardMessages()
	const canDeleteSelectedMessages = useCanDeleteSelectedMessages()
	const countSelected = useCountSelected()
	const deleteMessages = useDeleteSelectedMessages()

	const cancelSelecting = useCallback(() => {
		selectedMessageStore.reset();
	}, []);

	return (
		<ButtonGroup small mis='x4'>
			<Button primary onClick={forwardMessages} disabled={!countSelected}>{t('Forward_messages')}</Button>
			<Button danger onClick={deleteMessages} disabled={!countSelected || !canDeleteSelectedMessages}>{t('Delete')}</Button>
			<Button secondary onClick={cancelSelecting}>{t('Cancel')}</Button>
		</ButtonGroup>
	);
};

export default SelectedMessagesActions;
