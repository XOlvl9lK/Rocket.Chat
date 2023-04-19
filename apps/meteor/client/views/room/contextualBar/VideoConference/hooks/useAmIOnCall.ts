import { useState, useCallback, useEffect, useRef } from 'react';
import { AccountBox } from '/app/ui-utils/client';
import { useUser } from '@rocket.chat/ui-contexts';

export const useAmIOnCall = () => {
	const [openedCalls, setOpenedCalls] = useState<string[]>([])
	const once = useRef(false)
	const user = useUser()

	useEffect(() => {
		if (!once.current && user?.id) {
			AccountBox.setIsOnCall(user?._id, false);
			once.current = true;
		}
	}, [user]);

	const onCall = useCallback((windowId: string) => {
		setOpenedCalls(prev => [...prev, windowId]);
		AccountBox.setIsOnCall(user?._id, true);
	}, [user]);

	const offCall = useCallback((windowId: string) => {
		const restOpened = openedCalls.filter(id => id !== windowId);
		setOpenedCalls(restOpened);
		if (!restOpened.length) {
			AccountBox.setIsOnCall(user?._id, false);
		}
	}, [openedCalls, user]);

	return {
		onCall,
		offCall
	}
}
