import React, { useState, useCallback, useMemo } from 'react';
import { Field, InputBox, Box, Margins, Button, ButtonGroup } from '@rocket.chat/fuselage';
import { useTranslation, useEndpoint, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import type { IRoom } from '@rocket.chat/core-typings';

import VerticalBar from '../../../../components/VerticalBar';
import { ToolboxContextValue } from '/client/views/room/contexts/ToolboxContext';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { MessageAction } from '/app/ui-utils/client';

type MoveToMessageProps = {
	rid: IRoom['_id']
	tabBar: ToolboxContextValue['tabBar']
}

const getTimeZoneOffset = (): string => {
	const offset = new Date().getTimezoneOffset();
	const absOffset = Math.abs(offset);
	return `${offset < 0 ? '+' : '-'}${`00${Math.floor(absOffset / 60)}`.slice(-2)}:${`00${absOffset % 60}`.slice(-2)}`;
};

const MoveToMessage = ({ rid, tabBar }: MoveToMessageProps) => {
	const t = useTranslation();
	const [date, setDate] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const onClose = useMutableCallback(() => tabBar?.close());
	const dispatchToastMessage = useToastMessageDispatch();

	const onChangeDate = useCallback((e) => {
		setDate(e.target.value)
	}, [])

	const moveToMessageAction = useMemo(() =>  MessageAction.getButtonById('jump-to-search-message'), [])

	const getMessageToMove = useEndpoint('GET', '/v1/rooms.messageToMove')

	const onMoveToDate = useCallback(async (e) => {
		if (date) {
			try {
				setIsLoading(true)
				const message = await getMessageToMove({
					rid,
					date: new Date(`${date}T00:00:00${getTimeZoneOffset()}`).toISOString()
				})
				if (!message || message?.body === null) return dispatchToastMessage({ type: 'error', message: 'Сообщение не найдено' })
				moveToMessageAction.action(e, { message })
			} catch (e) {
				console.log(e);
			} finally {
				setIsLoading(false)
			}
		}
	}, [rid, date])

	const onMoveToStart = useCallback(async (e) => {
		try {
			setIsLoading(true)
			const message = await getMessageToMove({ rid })
			if (!message || message?.body === null) return dispatchToastMessage({ type: 'error', message: 'Сообщение не найдено' })
			moveToMessageAction.action(e, { message })
		} catch (e) {
			console.log(e);
		} finally {
			setIsLoading(false)
		}
	}, [rid])

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='jump' />
				<VerticalBar.Text>{t('Move_to_message')}</VerticalBar.Text>
				<VerticalBar.Close onClick={onClose} />
			</VerticalBar.Header>
			<VerticalBar.ScrollableContent>
				<Field>
					<Box display='flex' mi='neg-x4'>
						<Margins inline='x4'>
							<Button primary disabled={!date || isLoading} onClick={onMoveToDate}>{t('Move_to')}</Button>
							<InputBox type='date' h='x20' flexGrow={3} onChange={onChangeDate} />
						</Margins>
					</Box>
				</Field>
				<ButtonGroup stretch>
					<Button disabled={isLoading} primary onClick={onMoveToStart}>
						{t('Move_to_start')}
					</Button>
				</ButtonGroup>
			</VerticalBar.ScrollableContent>
		</>
	);
};

export default MoveToMessage;
