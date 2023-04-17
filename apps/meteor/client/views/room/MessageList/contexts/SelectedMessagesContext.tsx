import { createContext, useCallback, useContext } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useUser } from '@rocket.chat/ui-contexts';

import { selectedMessageStore, TSelectMessageStore } from '../../providers/SelectedMessagesProvider';

type SelectMessageContextValue = {
	selectedMessageStore: TSelectMessageStore;
};

export const SelectedMessageContext = createContext({
	selectedMessageStore,
} as SelectMessageContextValue);

export const useIsSelectedMessage = (mid: string): boolean => {
	const { selectedMessageStore } = useContext(SelectedMessageContext);

	const subscribe = useCallback(
		(callback: () => void): (() => void) => selectedMessageStore.on(mid, callback),
		[selectedMessageStore, mid],
	);

	const getSnapshot = useCallback(() => selectedMessageStore.isSelected(mid), []);

	return useSyncExternalStore(subscribe, getSnapshot);
};

export const useIsSelecting = (): boolean => {
	const { selectedMessageStore } = useContext(SelectedMessageContext);

	const subscribe = useCallback(
		(callback: () => void): (() => void) => selectedMessageStore.on('toggleIsSelecting', callback),
		[selectedMessageStore],
	);

	const getSnapshot = useCallback(() => selectedMessageStore.getIsSelecting(), []);

	return useSyncExternalStore(subscribe, getSnapshot);
};

export const useToggleSelect = (message: IMessage): (() => void) => {
	const { selectedMessageStore } = useContext(SelectedMessageContext);
	return useCallback(() => {
		selectedMessageStore.toggle(message);
	}, [message, selectedMessageStore]);
};

export const useCountSelected = (): number => {
	const { selectedMessageStore } = useContext(SelectedMessageContext);

	const subscribe = useCallback(
		(callback: () => void): (() => void) => selectedMessageStore.on('change', callback),
		[selectedMessageStore],
	);

	const getSnapshot = useCallback(() => selectedMessageStore.count(), []);

	return useSyncExternalStore(subscribe, getSnapshot);
};

export const useCanDeleteSelectedMessages = (): boolean => {
	const { selectedMessageStore } = useContext(SelectedMessageContext);
	const user = useUser();

	const subscribe = useCallback(
		(callback: () => void): (() => void) => selectedMessageStore.on('change', callback),
		[selectedMessageStore],
	)

	const getSnapshot = useCallback(() => selectedMessageStore.canDeleteSelectedMessages(user), [user]);

	return useSyncExternalStore(subscribe, getSnapshot);
}
