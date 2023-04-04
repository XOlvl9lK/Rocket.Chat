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
	const getDirectoryData = useEndpoint('GET', '/v1/users-to-invite');
	const [search, setSearch] = useState('')

	const debouncedSearch = useDebouncedValue(search, 500)

	const { data } = useQuery(
		['usersToInvite', debouncedSearch],
		() => getDirectoryData({
			query: JSON.stringify({
				text: debouncedSearch,
				rid: roomId
			}),
		}),
		{
			refetchOnWindowFocus: false,
		}
	)

	return {
		data,
		search,
		setSearch,
	}
}

const InviteToCallModal = ({ callId, onClose, roomId }: InviteToCallModalProps) => {
	const t = useTranslation();
	const [invited, setInvited] = useState<string[]>([])

	const {
		search,
		setSearch,
		data,
	} = useLoadUsersToInvite(roomId)

	const onInviteUsers = useCallback(() => {
		if (invited?.length) {
			VideoConfManager.invite(callId, invited)
				.then(() => {
					setInvited([])
					onClose()
					dispatchToastMessage({ type: 'success', message: t('Invitations_sent') })
				})
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
							filter={search}
							setFilter={setSearch}
						/>
					</Field.Row>
				</Field>
			</Modal.Content>
			<Modal.Footer>
				<Modal.FooterControllers>
					<Button onClick={onInviteUsers}>{t('Ok')}</Button>
					<Button onClick={onClose}>{t('Cancel')}</Button>
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export default InviteToCallModal;
