import { Modal, Field, Button, MultiSelectFiltered, AutoComplete, Box, Option, OptionAvatar, OptionContent, Chip } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useTranslation, useEndpoint, useUser } from '@rocket.chat/ui-contexts';
import React, { useState, useCallback, ReactElement, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VideoConfManager } from '/client/lib/VideoConfManager';
import { dispatchToastMessage } from '/client/lib/toast';
import UserAvatar from '/client/components/avatar/UserAvatar';
import RoomAvatar from '/client/components/avatar/RoomAvatar';

type InviteToCallModalProps = {
	onClose: () => void
	callId: string
	roomId: string
}

const useLoadUsersToInvite = (roomId: string) => {
	const getUsersToInvite = useEndpoint('GET', '/v1/users-to-invite');
	const [filter, setFilter] = useState('')
	const debouncedFilter = useDebouncedValue(filter, 500);

	const { data } = useQuery(
		['usersToInvite', debouncedFilter],
		() => getUsersToInvite({
			query: JSON.stringify({
				rid: roomId,
				text: debouncedFilter
			}),
		}),
		{
			refetchOnWindowFocus: false,
		}
	)

	return {
		data,
		filter,
		setFilter,
	}
}

const InviteToCallModal = ({ callId, onClose, roomId }: InviteToCallModalProps) => {
	const t = useTranslation();
	const [invited, setInvited] = useState<string[]>([])
	const [isInvitingInProgress, setIsInvitingInProgress] = useState(false)

	const {
		data,
		filter,
		setFilter,
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

	const options = useMemo(() => {
		if (Array.isArray(data?.result) && data?.result?.length) {
			return data.result.map(user => ({
				value: user._id,
				label: { name: user.username }
			}))
		}
		return []
	}, [data])

	return (
		<Modal>
			<Modal.Header>
				<Modal.Title>{t('Invite_to_call')}</Modal.Title>
			</Modal.Header>
			<Modal.Content>
				<Field>
					<Field.Row>
						<AutoComplete
							value={invited}
							onChange={(value) => setInvited(value as string[])}
							filter={filter}
							setFilter={setFilter}
							multiple
							renderSelected={({ selected: { value, label }, onRemove, ...props }): ReactElement => (
								<Chip {...props} height='x20' value={value} onClick={onRemove} mie='x4'>
									<UserAvatar size='x20' username={label.name} />
									<Box is='span' margin='none' mis='x4'>
										{label.name}
									</Box>
								</Chip>
							)}
							renderItem={({ value, label, ...props }): ReactElement => (
								<Option key={value} {...props}>
									<OptionAvatar>
										<UserAvatar size='x20' username={label.name} />
									</OptionAvatar>
									<OptionContent>{label.name}</OptionContent>
								</Option>
							)}
							options={options}
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
