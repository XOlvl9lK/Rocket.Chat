import { Emitter } from '@rocket.chat/emitter';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import type { IMessage, IRoom } from '@rocket.chat/core-typings';

import { SelectedMessageContext } from '../MessageList/contexts/SelectedMessagesContext';
import { MessageTypes } from '/app/ui-utils/lib/MessageTypes';
import { hasPermission } from '/app/authorization/client';
import { settings } from '/app/settings/client';
import moment from 'moment/moment';

// data-qa-select

export const selectedMessageStore = new (class SelectMessageStore extends Emitter<
	{
		change: undefined;
		toggleIsSelecting: boolean;
	} & { [mid: string]: boolean }
> {
	store = new Map<string, IMessage>()

	isSelecting = false;

	setIsSelecting(isSelecting: boolean): void {
		this.isSelecting = isSelecting;
		this.emit('toggleIsSelecting', isSelecting);
	}

	getIsSelecting(): boolean {
		return this.isSelecting;
	}

	isSelected(mid: string): boolean {
		return Boolean(this.store.has(mid))
	}

	getSelectedMessages(): IMessage[] {
		return Array.from(this.store.values())
	}

	toggle(message: IMessage): void {
		if (this.store.has(message._id)) {
			this.store.delete(message._id)
			this.emit(message._id, false);
			this.emit('change');
			return;
		}
		this.store.set(message._id, message)
		this.emit(message._id, true);
		this.emit('change');
	}

	count(): number {
		return this.store.size;
	}

	clearStore(): void {
		const selectedMessages = this.getSelectedMessages();
		this.store.clear();
		selectedMessages.forEach((message) => this.emit(message._id, false));
		this.emit('change');
	}

	reset(): void {
		this.clearStore();
		this.isSelecting = false;
		this.emit('toggleIsSelecting', false);
	}

	canDeleteSelectedMessages(rid: IRoom['_id']) {
		const selectedMessages = this.getSelectedMessages()
		return !selectedMessages.some(message => !this.canDeleteMessage(message, rid))
	}

	canDeleteMessage(message: IMessage, rid: IRoom['_id']) {
		const uid = Meteor.userId();
		if (!uid) {
			return false;
		}

		if (MessageTypes.isSystemMessage(message)) {
			return false;
		}

		const forceDeleteAllowed = hasPermission('force-delete-message', message.rid);
		if (forceDeleteAllowed) {
			return true;
		}

		const deletionEnabled = settings.get('Message_AllowDeleting') as boolean | undefined;
		if (!deletionEnabled) {
			return false;
		}

		const deleteAnyAllowed = hasPermission('delete-message', rid);
		const deleteOwnAllowed = hasPermission('delete-own-message');
		const deleteAllowed = deleteAnyAllowed || (deleteOwnAllowed && message?.u && message.u._id === Meteor.userId());

		if (!deleteAllowed) {
			return false;
		}

		const blockDeleteInMinutes = settings.get('Message_AllowDeleting_BlockDeleteInMinutes') as number | undefined;
		const bypassBlockTimeLimit = hasPermission('bypass-time-limit-edit-and-delete');
		const elapsedMinutes = moment().diff(message.ts, 'minutes');
		const onTimeForDelete = bypassBlockTimeLimit || !blockDeleteInMinutes || !elapsedMinutes || elapsedMinutes <= blockDeleteInMinutes;

		return deleteAllowed && onTimeForDelete;
	}
})();

export type TSelectMessageStore = typeof selectedMessageStore

export const SelectedMessagesProvider: FC = ({ children }) => {
	const value = useMemo(
		() => ({
			selectedMessageStore,
		}),
		[],
	);

	return <SelectedMessageContext.Provider value={value}>{children}</SelectedMessageContext.Provider>;
};
