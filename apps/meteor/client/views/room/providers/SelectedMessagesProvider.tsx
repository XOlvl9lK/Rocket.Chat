import { Emitter } from '@rocket.chat/emitter';
import type { FC } from 'react';
import React, { useMemo } from 'react';
import type { IMessage } from '@rocket.chat/core-typings';

import { SelectedMessageContext } from '../MessageList/contexts/SelectedMessagesContext';

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

	canDeleteSelectedMessages(user: any) {
		const selectedMessages = this.getSelectedMessages()
		return !selectedMessages.find(m => m.u._id !== user._id)
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
