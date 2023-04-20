import { useEffect, useRef } from 'react';

export const useEffectOnce = (
	condition: boolean,
	callback: () => void,
	deps: any[]
) => {
	const once = useRef(false)

	useEffect(() => {
		if (condition && !once.current) {
			callback()
			once.current = true
		}
	}, [condition, ...deps])
}
