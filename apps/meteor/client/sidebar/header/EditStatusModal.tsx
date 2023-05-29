import type { IUser } from '@rocket.chat/core-typings';
import { Field, TextInput, FieldGroup, Modal, Button, Box, InputBox, Margins, Tabs, Select, Options } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useToastMessageDispatch, useSetting, useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import type { ReactElement, ChangeEvent, ComponentProps, FormEvent } from 'react';
import React, { useState, useCallback, useMemo, forwardRef } from 'react';

import UserStatusMenu from '../../components/UserStatusMenu';
import { USER_STATUS_TEXT_MAX_LENGTH } from '../../lib/constants';
import { EmojiStatus } from '/client/components/EmojiStatus';
import { SelectStatus } from '/client/sidebar/header/SelectStatus';

type EditStatusModalProps = {
	onClose: () => void;
	userStatus: IUser['status'];
	userStatusText: IUser['statusText'];
};

const getTimeZoneOffset = (): string => {
	const offset = new Date().getTimezoneOffset();
	const absOffset = Math.abs(offset);
	return `${offset < 0 ? '+' : '-'}${`00${Math.floor(absOffset / 60)}`.slice(-2)}:${`00${absOffset % 60}`.slice(-2)}`;
};

const EditStatusModal = ({ onClose, userStatus, userStatusText }: EditStatusModalProps): ReactElement => {
	const allowUserStatusMessageChange = useSetting('Accounts_AllowUserStatusMessageChange');
	const dispatchToastMessage = useToastMessageDispatch();

	const t = useTranslation();
	const [statusText, setStatusText] = useState('');
	const [statusType, setStatusType] = useState('online');
	const [statusTextError, setStatusTextError] = useState<string | undefined>();
	const [statusEmoji, setStatusEmoji] = useState<string>()
	const [periodStart, setPeriodStart] = useState('')
	const [periodEnd, setPeriodEnd] = useState('')
	const [tab, setTab] = useState<'create' | 'select'>('create')

	const setUserStatus = useEndpoint('POST', '/v1/users.setStatus');

	const handleStatusText = useMutableCallback((e: ChangeEvent<HTMLInputElement>): void => {
		setStatusText(e.currentTarget.value);

		if (statusText && statusText.length > USER_STATUS_TEXT_MAX_LENGTH) {
			return setStatusTextError(t('Max_length_is', USER_STATUS_TEXT_MAX_LENGTH));
		}

		return setStatusTextError(undefined);
	});

	const handleStatusType = (type: IUser['status']): void => setStatusType(type);

	const handleSaveStatus = useCallback(async () => {
		try {
			const period: string[] = []
			if (periodStart && periodEnd) {
				period.push(
					new Date(`${new Date().toISOString().split('T')[0]}T${periodStart}:00${getTimeZoneOffset()}`).toISOString(),
					new Date(`${new Date().toISOString().split('T')[0]}T${periodEnd}:00${getTimeZoneOffset()}`).toISOString(),
				)
			}
			await setUserStatus({ message: statusText, status: statusType, statusEmoji, period });
			dispatchToastMessage({ type: 'success', message: t('StatusMessage_Changed_Successfully') });
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}

		onClose();
	}, [dispatchToastMessage, setUserStatus, statusText, statusType, onClose, t, statusEmoji, periodStart, periodEnd]);

	const onSelectStatus = useCallback((status: string, statusText?: string, statusEmoji?: string) => {
		setStatusType(status)
		setStatusText(statusText || '')
		setStatusEmoji(statusEmoji)
	}, [])

	const onTabClick = useCallback((tab: 'create' | 'select') => {
		setStatusType('online')
		setStatusText('')
		setStatusEmoji(undefined)
		setTab(tab)
	}, [])

	return (
		<Modal>
			<Modal.Header>
				<Modal.Icon name='info' />
				<Modal.Title>{t('Edit_Status')}</Modal.Title>
				<Modal.Close onClick={onClose} />
			</Modal.Header>
			<Modal.Content fontScale='p2'>
				<Tabs>
					<Tabs.Item selected={tab === 'create'} onClick={() => onTabClick('create')}>
						Создать
					</Tabs.Item>
					<Tabs.Item selected={tab === 'select'} onClick={() => onTabClick('select')}>
						Выбрать
					</Tabs.Item>
				</Tabs>
				<Box
					is='form'
					id='saveStatus'
					onSubmit={(e: FormEvent) => {
						e.preventDefault();
						handleSaveStatus();
					}}
					padding='10px 0 0 0'
				>
					<FieldGroup>
						{tab === 'create' ?
							<Field>
								<Field.Label>{t('StatusMessage')}</Field.Label>
								<Field.Row>
									<TextInput
										error={statusTextError}
										disabled={!allowUserStatusMessageChange}
										flexGrow={1}
										value={statusText}
										onChange={handleStatusText}
										placeholder={t('StatusMessage_Placeholder')}
										addon={
											<Box display='flex' alignItems='center' justifyContent='space-between' w='60px'>
												<EmojiStatus statusEmoji={statusEmoji} setStatusEmoji={setStatusEmoji} />
												<UserStatusMenu margin='neg-x2' onChange={handleStatusType} initialStatus={statusType} />
											</Box>
										}
									/>
								</Field.Row>
								{!allowUserStatusMessageChange && <Field.Hint>{t('StatusMessage_Change_Disabled')}</Field.Hint>}
								<Field.Error>{statusTextError}</Field.Error>
							</Field>
							:
							<SelectStatus onSelectStatus={onSelectStatus} />
						}
						<Field margin='0'>
							<Field.Label>Период</Field.Label>
							<Field.Row>
								<Margins inline='x4'>
									<InputBox type='time' value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} flexGrow={1} h='x20' />
									<InputBox type='time' value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} flexGrow={1} h='x20' />
								</Margins>
							</Field.Row>
						</Field>
					</FieldGroup>
				</Box>
			</Modal.Content>
			<Modal.Footer>
				<Modal.FooterControllers>
					<Button secondary onClick={onClose}>
						{t('Cancel')}
					</Button>
					<Button primary type='submit' disabled={!!statusTextError || !statusText} form='saveStatus'>
						{t('Save')}
					</Button>
				</Modal.FooterControllers>
			</Modal.Footer>
		</Modal>
	);
};

export default EditStatusModal;
