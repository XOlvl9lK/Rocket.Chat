import React, { useMemo } from 'react';
import { Box, Field, Icon, MessageEmoji, Select } from '@rocket.chat/fuselage';
import { useSetting, useEndpoint } from '@rocket.chat/ui-contexts';
import { useQuery } from '@tanstack/react-query';
import { detectEmoji } from '/client/lib/utils/detectEmoji';
import { UserStatus } from '/client/components/UserStatus';

type SelectStatusProps = {
	onSelectStatus: (status: string, statusText?: string, statusEmoji?: string) => void
}

export const SelectStatus = ({ onSelectStatus }: SelectStatusProps) => {
	const allowUserStatusMessageChange = useSetting('Accounts_AllowUserStatusMessageChange');
	const getCustomStatuses = useEndpoint('GET', '/v1/users.getCustomStatuses');

	const { data } = useQuery(['customStatuses'], () => getCustomStatuses())

	const statusOptions = useMemo(() => {
		if (!data?.customStatuses?.length) return []
		return data.customStatuses.map(({ status, statusText, statusEmoji }, idx) => {
			return [`${statusText};${statusEmoji};${status};${idx}`, status]
		})
	}, [data])

	return (
		<Field>
			<Field.Label>Статус</Field.Label>
			<Field.Row>
				<Select
					disabled={!allowUserStatusMessageChange}
					options={statusOptions}
					onChange={(value) => {
						if (value) {
							const [statusText, statusEmoji, status] = value?.split(';')
							if (status) {
								onSelectStatus(status, statusText, statusEmoji)
							}
						}
					}}
					renderItem={RenderItem}
					renderSelected={RenderItem}
				/>
			</Field.Row>
			<Field.Error></Field.Error>
		</Field>
	);
};

const RenderItem = (itemProps: any) => {
	const [statusText, statusEmoji, status] = useMemo(() => itemProps?.value?.split(';'), [itemProps])

	const [emojiResult] = useMemo(() => {
		if (!statusEmoji) return []
		return detectEmoji(statusEmoji)
	}, [statusEmoji])

	return <Box {...itemProps} key={itemProps.value} rcx-option display='flex' justifyContent='space-between' w='100%'>
		<p>{statusText}</p>
		<Box display='flex' w='60px' alignItems='center' justifyContent='space-between'>
			{emojiResult ?
				<MessageEmoji className={emojiResult.className} name={emojiResult.name} image={emojiResult.image}>
					{emojiResult.content}
				</MessageEmoji>
				:
				<Icon name='emoji' size='x20' />
			}
			<UserStatus status={status} />
		</Box>
	</Box>
}
