import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import React, { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import { queryClient } from '../../lib/queryClient';
import OutermostErrorBoundary from './OutermostErrorBoundary';
import PageLoading from './PageLoading';

const MeteorProvider = lazy(() => import('../../providers/MeteorProvider'));
const AppLayout = lazy(() => import('./AppLayout'));

const AppRoot = (): ReactElement => (
	<OutermostErrorBoundary>
		<Helmet>
			<meta charSet='utf-8' />
			<meta http-equiv='content-type' content='text/html; charset=utf-8' />
			<meta http-equiv='expires' content='-1' />
			<meta http-equiv='X-UA-Compatible' content='IE=edge' />
			<meta name='fragment' content='!' />
			<meta name='distribution' content='global' />
			<meta name='rating' content='general' />
			<meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' />
			<meta name='mobile-web-app-capable' content='yes' />
			<meta name='apple-mobile-web-app-capable' content='yes' />
			<meta name='msapplication-TileImage' content='assets/tile_144.png' />
			<meta name='msapplication-config' content='images/browserconfig.xml' />
			<meta property='og:image' content='assets/favicon_512.png' />
			<meta property='twitter:image' content='assets/favicon_512.png' />
			<link rel='manifest' href='images/manifest.json' />
			<link rel='chrome-webstore-item' href='https://chrome.google.com/webstore/detail/nocfbnnmjnndkbipkabodnheejiegccf' />
			<link rel='mask-icon' href='assets/safari_pinned.svg' color='#04436a' />
			<link rel='apple-touch-icon' sizes='180x180' href='assets/touchicon_180.png' />
			<link rel='apple-touch-icon-precomposed' href='assets/touchicon_180_pre.png' />
		</Helmet>
		<Suspense fallback={<PageLoading />}>
			<QueryClientProvider client={queryClient}>
				<MeteorProvider>
					<AppLayout />
				</MeteorProvider>
			</QueryClientProvider>
		</Suspense>
	</OutermostErrorBoundary>
);

export default AppRoot;
