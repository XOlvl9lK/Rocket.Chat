import React, { memo, ReactNode, useMemo, VFC } from 'react';
import type { IMessage } from '@rocket.chat/core-typings';
import { isMessageReactionsNormalized, isThreadMainMessage } from '@rocket.chat/core-typings';
import { useLayout, useUser, useUserPreference, useSetting, useEndpoint, useQueryStringParameter } from '@rocket.chat/ui-contexts';
import { useKatex } from '/client/views/room/MessageList/hooks/useKatex';
import { useLoadSurroundingMessages } from '/client/views/room/MessageList/hooks/useLoadSurroundingMessages';
import { MessageListContext, MessageListContextValue } from '/client/components/message/list/MessageListContext';
import { getRegexHighlight, getRegexHighlightUrl } from '/app/highlight-words/client/helper';
import { EmojiPicker } from '/app/emoji';
import AttachmentProvider from '/client/providers/AttachmentProvider';

type GlobalSearchListProviderProps = {
	children: ReactNode;
	scrollMessageList?: MessageListContextValue['scrollMessageList'];
	attachmentDimension?: {
		width?: number;
		height?: number;
	};
};

const GlobalSearchListProvider: VFC<GlobalSearchListProviderProps> = ({ children, scrollMessageList, attachmentDimension }) => {
	const reactToMessage = useEndpoint('POST', '/v1/chat.react');
	const user = useUser();
	const uid = user?._id;
	const username = user?.username;

	const { isMobile } = useLayout();

	const showRealName = Boolean(useSetting('UI_Use_Real_Name'));
	const showColors = useSetting('HexColorPreview_Enabled') as boolean;

	const displayRolesGlobal = Boolean(useSetting('UI_DisplayRoles'));
	const hideRolesPreference = Boolean(!useUserPreference<boolean>('hideRoles') && !isMobile);
	const showRoles = displayRolesGlobal && hideRolesPreference;
	const showUsername = Boolean(!useUserPreference<boolean>('hideUsernames') && !isMobile);
	const highlights = useUserPreference<string[]>('highlights');

	const { katexEnabled, katexDollarSyntaxEnabled, katexParenthesisSyntaxEnabled } = useKatex();

	const msgParameter = useQueryStringParameter('msg');

	useLoadSurroundingMessages(msgParameter);

	const context: MessageListContextValue = useMemo(
		() => ({
			showColors,
			useReactionsFilter: (message: IMessage): ((reaction: string) => string[]) => {
				const { reactions } = message;
				return !showRealName
					? (reaction: string): string[] =>
						reactions?.[reaction]?.usernames.filter((user) => user !== username).map((username) => `@${username}`) || []
					: (reaction: string): string[] => {
						if (!reactions?.[reaction]) {
							return [];
						}
						if (!isMessageReactionsNormalized(message)) {
							return message.reactions?.[reaction]?.usernames.filter((user) => user !== username).map((username) => `@${username}`) || [];
						}
						if (!username) {
							return message.reactions[reaction].names;
						}
						const index = message.reactions[reaction].usernames.indexOf(username);
						if (index === -1) {
							return message.reactions[reaction].names;
						}

						return message.reactions[reaction].names.splice(index, 1);
					};
			},
			useUserHasReacted: username
				? (message) =>
					(reaction): boolean =>
						Boolean(message.reactions?.[reaction].usernames.includes(username))
				: () => (): boolean => false,
			useShowFollowing: uid
				? ({ message }): boolean => Boolean(message.replies && message.replies.indexOf(uid) > -1 && !isThreadMainMessage(message))
				: (): boolean => false,
			useShowTranslated: () => false,
			useShowStarred: (): boolean => false,
			useMessageDateFormatter:
				() =>
					(date: Date): string =>
						date.toLocaleString(),
			showRoles,
			showRealName,
			showUsername,
			jumpToMessageParam: msgParameter,
			...(katexEnabled && {
				katex: {
					dollarSyntaxEnabled: katexDollarSyntaxEnabled,
					parenthesisSyntaxEnabled: katexParenthesisSyntaxEnabled,
				},
			}),
			highlights: highlights
				?.map((str) => str.trim())
				.map((highlight) => ({
					highlight,
					regex: getRegexHighlight(highlight),
					urlRegex: getRegexHighlightUrl(highlight),
				})),

			useOpenEmojiPicker: uid
				? (message) =>
					(e): void => {
						e.nativeEvent.stopImmediatePropagation();
						EmojiPicker.open(
							e.currentTarget,
							(emoji: string) => reactToMessage({ messageId: message._id, reaction: emoji }) as unknown as void,
						);
					}
				: () => (): void => undefined,
		}),
		[
			username,
			uid,
			showRoles,
			showRealName,
			showUsername,
			katexEnabled,
			katexDollarSyntaxEnabled,
			katexParenthesisSyntaxEnabled,
			highlights,
			reactToMessage,
			showColors,
			msgParameter,
		],
	);

	return (
		<AttachmentProvider width={attachmentDimension?.width} height={attachmentDimension?.height}>
			<MessageListContext.Provider value={context}>{children}</MessageListContext.Provider>
		</AttachmentProvider>
	);
};

export default memo(GlobalSearchListProvider);
