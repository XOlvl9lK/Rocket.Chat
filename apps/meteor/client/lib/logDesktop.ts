
type RocketDesktopApi = typeof window & {
	RocketChatDesktop?: {
		log?: (text: string) => void;
	};
};

export const logDesktop = (text: string) => {
	const windowMaybeDesktop = window as RocketDesktopApi
	if (windowMaybeDesktop?.RocketChatDesktop?.log) {
		windowMaybeDesktop.RocketChatDesktop.log(text)
	} else {
		console.log('No desktop api');
	}
}
