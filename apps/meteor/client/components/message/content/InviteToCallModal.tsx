import { Modal, Field, Button, MultiSelectFiltered } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useTranslation, useEndpoint, useUser } from '@rocket.chat/ui-contexts';
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VideoConfManager } from '/client/lib/VideoConfManager';
import { dispatchToastMessage } from '/client/lib/toast';

type InviteToCallModalProps = {
	onClose: () => void
	callId: string
	roomId: string
}

const useLoadUsersToInvite = (roomId: string) => {
	const getUsersToInvite = useEndpoint('GET', '/v1/users-to-invite');

	const { data } = useQuery(
		['usersToInvite'],
		() => getUsersToInvite({
			query: JSON.stringify({
				rid: roomId
			}),
		}),
		{
			refetchOnWindowFocus: false,
		}
	)

	return {
		data,
	}
}

const InviteToCallModal = ({ callId, onClose, roomId }: InviteToCallModalProps) => {
	const t = useTranslation();
	const [invited, setInvited] = useState<string[]>([])
	const [isInvitingInProgress, setIsInvitingInProgress] = useState(false)

	const {
		data,
	} = useLoadUsersToInvite(roomId)

	const onInviteUsers = useCallback(() => {
		if (invited?.length) {
			setIsInvitingInProgress(true)
			VideoConfManager.invite(callId, invited)
				.then(() => {
					setInvited([])
					onClose()
					dispatchToastMessage({ type: 'success', message: t('Invitations_sent') })
				})
				.finally(() => setIsInvitingInProgress(false))
		}
	}, [invited])

	return (
		<Modal>
			<Modal.Header>
				<Modal.Title>{t('Invite_to_call')}</Modal.Title>
			</Modal.Header>
			<Modal.Content>
				<Field>
					<Field.Row>
						<MultiSelectFiltered
							options={Array.isArray(data?.result) ? data?.result?.map(user => [user._id, user.username]) : []}
							onChange={(values) => setInvited(values)}
						/>
					</Field.Row>
				</Field>
			</Modal.Content>
			<Modal.Footer>
				<Modal.FooterControllers>
					<Button disabled={isInvitingInProgress} onClick={onInviteUsers}>{t('Ok')}</Button>
					<Button disabled={isInvitingInProgress} onClick={onClose}>{t('Cancel')}</Button>
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export default InviteToCallModal;
