import { createRouteGroup } from '/client/lib/createRouteGroup';
import { lazy } from 'react';

export const registerMarketplaceRoute = createRouteGroup(
	'marketplace',
	'/marketplace',
	lazy(() => import('../marketplace/MarketplaceRouter')),
);

registerMarketplaceRoute('/:context?/:page?/:id?/:version?/:tab?', {
	name: 'marketplace',
	component: lazy(() => import('../marketplace/AppsRoute')),
});
