import { useState, useCallback, useEffect } from 'react';
import { AccountBox } from '/app/ui-utils/client';

export const useAmIOnCall = () => {
	const [openedCalls, setOpenedCalls] = useState<string[]>([])

	const trigger = useCallback((windowId: string) => {
		setOpenedCalls(prev => [...prev, windowId]);

		return () => setOpenedCalls(prev => prev.filter(id => id !== windowId));
	}, []);

	useEffect(() => {
		if (openedCalls.length > 0) {
			AccountBox.setIsOnCall(true)
		} else {
			AccountBox.setIsOnCall(false)
		}
	}, [openedCalls])

	return trigger
}
