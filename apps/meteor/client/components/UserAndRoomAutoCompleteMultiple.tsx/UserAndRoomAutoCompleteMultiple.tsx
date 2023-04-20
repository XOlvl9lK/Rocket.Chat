import { isDirectMessageRoom } from '@rocket.chat/core-typings';
import { AutoComplete, Box, Option, OptionAvatar, OptionContent, Chip } from '@rocket.chat/fuselage';
import { useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { escapeRegExp } from '@rocket.chat/string-helpers';
import { useUser, useUserSubscriptions, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement } from 'react';
import React, { memo, useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { roomCoordinator } from '../../lib/rooms/roomCoordinator';
import RoomAvatar from '../avatar/RoomAvatar';
import UserAvatar from '../avatar/UserAvatar';

type UserAndRoomAutoCompleteMultipleProps = Omit<ComponentProps<typeof AutoComplete>, 'filter'> & {
	setSelected: (selected: { id: string, type: 'user' | 'channel' }) => void
};

const UserAndRoomAutoCompleteMultiple = ({ value, onChange, setSelected, ...props }: UserAndRoomAutoCompleteMultipleProps): ReactElement => {
	const user = useUser();
	const [filter, setFilter] = useState('');
	const debouncedFilter = useDebouncedValue(filter, 500);

	const getOptions = useEndpoint('GET', '/v1/optionsToShareMessages')
	const { data } = useQuery(
		['getOptionsToShareMessages', debouncedFilter],
		() => getOptions({
			query: JSON.stringify({
				text: debouncedFilter
			})
		})
	)

	const query = useMemo(() => ({ open: { $ne: false }, lowerCaseName: new RegExp(escapeRegExp(debouncedFilter), 'i') }), [debouncedFilter])

	const rooms = useUserSubscriptions(query).filter((room) => {
		if (!user) {
			return;
		}

		if (isDirectMessageRoom(room) && (room.blocked || room.blocker)) {
			return;
		}

		return !roomCoordinator.readOnly(room.rid, user);
	});

	const options = useMemo(
		() => {
			if (data?.result?.length) {
				return data.result.map(r => ({
					label: { name: r.label, type: r.type },
					value: r.id,
				}));
			}
			return []
		},
		[data],
	);

	useEffect(() => {
		if (options.length) {
			setSelected(
				options
					.filter(o => value.includes(o.value))
					.map(o => ({ id: o.value, type: o.label.type }))
			);
		}
	}, [value]);

	return (
		<AutoComplete
			{...props}
			value={value}
			onChange={onChange}
			filter={filter}
			setFilter={setFilter}
			multiple
			renderSelected={({ selected: { value, label }, onRemove, ...props }): ReactElement => (
				<Chip {...props} height='x20' value={value} onClick={onRemove} mie='x4'>
					{label.type === 'user' ? (
						<UserAvatar size='x20' username={label.name} />
					) : (
						<RoomAvatar size='x20' room={{ _id: value, type: 'c' }} />
					)}
					<Box is='span' margin='none' mis='x4'>
						{label.name}
					</Box>
				</Chip>
			)}
			renderItem={({ value, label, ...props }): ReactElement => (
				<Option key={value} {...props}>
					<OptionAvatar>
						{label.type === 'user' ? (
							<UserAvatar size='x20' username={label.name} />
						) : (
							<RoomAvatar size='x20' room={{ _id: value, type: 'c' }} />
						)}
					</OptionAvatar>
					<OptionContent>{label.name}</OptionContent>
				</Option>
			)}
			options={options}
		/>
	);
};

export default memo(UserAndRoomAutoCompleteMultiple);
