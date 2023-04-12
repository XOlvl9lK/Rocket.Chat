import { css } from '@rocket.chat/css-in-js';
import { Box, Palette } from '@rocket.chat/fuselage';
import { useSessionStorage } from '@rocket.chat/fuselage-hooks';
import { useLayout, useSetting, useUserPreference } from '@rocket.chat/ui-contexts';
import React, { createContext, useState, useMemo } from 'react';

import SidebarRoomList from './RoomList';
import SidebarFooter from './footer';
import SidebarHeader from './header';
import StatusDisabledSection from './sections/StatusDisabledSection';

type SidebarWidthContextValue = {
	setWidth: (width: number) => void
}

export const SidebarWidthContext = createContext<SidebarWidthContextValue>({
	setWidth: (width) => {}
})

const Sidebar = () => {
	const sidebarViewMode = useUserPreference('sidebarViewMode');
	const sidebarHideAvatar = !useUserPreference('sidebarDisplayAvatar');
	const { isMobile, sidebar } = useLayout();
	const [bannerDismissed, setBannerDismissed] = useSessionStorage('presence_cap_notifier', false);
	const presenceDisabled = useSetting<boolean>('Presence_broadcast_disabled');
	const [sidebarWidth, setSidebarWidth] = useState(280)

	const context = useMemo<SidebarWidthContextValue>(() => ({
		setWidth: (width: number) => setSidebarWidth(width)
	}), [])

	const sideBarBackground = css`
		background-color: ${Palette.surface['surface-tint']};
	`;

	const sideBarStyle = css`
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		flex: 0 0 ${sidebarWidth}px;
		width: ${sidebarWidth}px;
		max-width: ${sidebarWidth}px;
		height: 100%;
		user-select: none;
		transition: transform 0.3s;

		&.opened {
			box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 15px 1px;
			transform: translate3d(0px, 0px, 0px);
		}

		@media (max-width: 767px) {
			position: absolute;
			user-select: none;
			transform: translate3d(-100%, 0, 0);
			-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
			touch-action: pan-y;
			-webkit-user-drag: none;
			will-change: transform;

			.rtl & {
				transform: translate3d(200%, 0, 0);

				&.opened {
					box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 15px 1px;
					transform: translate3d(0px, 0px, 0px);
				}
			}
		}

		@media (min-width: 1372px) {
			/* 1440px -68px (eletron menu) */
			flex: 0 0 20%;

			width: 20%;
			max-width: 20%;
		}
	`;

	const sidebarWrapStyle = css`
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0;
		height: 100%;
		user-select: none;
		transition: opacity 0.3s;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		touch-action: pan-y;
		-webkit-user-drag: none;

		&.opened {
			width: 100%;
			background-color: rgb(0, 0, 0);
			opacity: 0.8;
		}
	`;

	return (
		<>
			<Box id='sidebar-region' className={['rcx-sidebar', !sidebar.isCollapsed && isMobile && 'opened', sideBarStyle].filter(Boolean)}>
				<Box
					display='flex'
					flexDirection='column'
					height='100%'
					is='nav'
					className={[
						'rcx-sidebar--main',
						`rcx-sidebar rcx-sidebar--${sidebarViewMode}`,
						sidebarHideAvatar && 'rcx-sidebar--hide-avatar',
						sideBarBackground,
					].filter(Boolean)}
					role='navigation'
					data-qa-opened={sidebar.isCollapsed ? 'false' : 'true'}
				>
					<SidebarWidthContext.Provider value={context}>
						<SidebarHeader />
						{presenceDisabled && !bannerDismissed && <StatusDisabledSection onDismiss={() => setBannerDismissed(true)} />}
						<SidebarRoomList />
						<SidebarFooter />
					</SidebarWidthContext.Provider>
				</Box>
			</Box>
			{isMobile && (
				<Box className={[sidebarWrapStyle, !sidebar.isCollapsed && 'opened'].filter(Boolean)} onClick={() => sidebar.toggle()}></Box>
			)}
		</>
	);
};

export default Sidebar;
