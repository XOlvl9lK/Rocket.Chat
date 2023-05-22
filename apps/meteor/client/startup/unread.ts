import type { ISubscription } from '@rocket.chat/core-typings';
import { manageFavicon } from '@rocket.chat/favicon';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { ChatSubscription, ChatRoom } from '../../app/models/client';
import { settings } from '../../app/settings/client';
import { getUserPreference } from '../../app/utils/client';
import { fireGlobalEvent } from '../lib/utils/fireGlobalEvent';

const fetchSubscriptions = (): ISubscription[] =>
	ChatSubscription.find(
		{
			open: true,
			hideUnreadStatus: { $ne: true },
			archived: { $ne: true },
		},
		{
			fields: {
				unread: 1,
				alert: 1,
				rid: 1,
				t: 1,
				name: 1,
				ls: 1,
				unreadAlert: 1,
				fname: 1,
				prid: 1,
				tunread: 1,
				userMentions: 1,
				groupMentions: 1
			},
		},
	).fetch();

Meteor.startup(() => {
	Tracker.autorun(() => {
		const userUnreadAlert = getUserPreference(Meteor.userId(), 'unreadAlert');

		let unreadAlert: false | '•' = false;

		const subscriptions = fetchSubscriptions()

		const unreadCount = subscriptions.reduce<number>((count, subscription) =>
			Tracker.nonreactive(() => {
				const room = ChatRoom.findOne({ _id: subscription.rid }, { fields: { usersCount: 1 } });
				fireGlobalEvent('unread-changed-by-subscription', {
					...subscription,
					usersCount: room?.usersCount,
				});
				if (subscription.alert || subscription.unread > 0) {
					if (subscription.alert === true && subscription.unreadAlert !== 'nothing') {
						if (subscription.unreadAlert === 'all' || userUnreadAlert !== false) {
							unreadAlert = '•';
						}
					}
				}

				if (subscription.t === 'd') {
					if (subscription.unread > 0 || subscription.tunread?.length > 0) {
						return count + 1
					}
				} else {
					if (subscription.userMentions > 0 || subscription.groupMentions > 0 || subscription.tunread?.length > 0) {
						return count + 1
					}
				}

				return count
			}), 0)

		if (unreadCount > 0) {
			if (unreadCount > 999) {
				Session.set('unread', '999+');
			} else {
				Session.set('unread', unreadCount);
			}
		} else if (unreadAlert !== false) {
			Session.set('unread', unreadAlert);
		} else {
			Session.set('unread', '');
		}
	});
});

Meteor.startup(() => {
	const updateFavicon = manageFavicon();

	Tracker.autorun(() => {
		const siteName = settings.get('Site_Name') ?? '';

		const unread = Session.get('unread');
		fireGlobalEvent('unread-changed', unread);

		updateFavicon(unread);

		document.title = unread === '' ? siteName : `(${unread}) ${siteName}`;
	});
});
