import React, { forwardRef, Fragment, MouseEventHandler, MutableRefObject, Ref, useEffect, useRef, useState } from 'react';
import { useAutoFocus, useMergedRefs, useMutableCallback, useUniqueId, useDebouncedValue } from '@rocket.chat/fuselage-hooks';
import { useUserPreference, useUserSubscriptions, useSetting, useTranslation, useMethod, useUserId, useToastMessageDispatch } from '@rocket.chat/ui-contexts';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Sidebar, TextInput, Box, Icon } from '@rocket.chat/fuselage';
import { css } from '@rocket.chat/css-in-js';
import { usePreventDefault } from '/client/sidebar/hooks/usePreventDefault';
import tinykeys from 'tinykeys';
import ScrollableContentWrapper from '/client/components/ScrollableContentWrapper';
import { isMessageNewDay } from '/client/views/room/MessageList/lib/isMessageNewDay';
import { MessageTypes } from '/app/ui-utils/lib/MessageTypes';
import SystemMessage from '/client/components/message/variants/SystemMessage';
import GlobalSearchListProvider from './GlobalSearchListProvider';
import SearchRow from './SearchRow';
import { useQuery } from '@tanstack/react-query';

type GlobalSearchListProps = {
	onClose: () => void
}

const shortcut = ((): string => {
	if (!(Meteor as any).Device.isDesktop()) {
		return '';
	}
	if (window.navigator.platform.toLowerCase().includes('mac')) {
		return '(\u2318+K)';
	}
	return '(\u2303+K)';
})();

const toggleSelectionState = (next: HTMLElement, current: HTMLElement | undefined, input: HTMLElement | undefined): void => {
	input?.setAttribute('aria-activedescendant', next.id);
	next.setAttribute('aria-selected', 'true');
	next.classList.add('rcx-sidebar-item--selected');
	if (current) {
		current.removeAttribute('aria-selected');
		current.classList.remove('rcx-sidebar-item--selected');
	}
};

const useGlobalMessageSearchQuery = (
	{
		limit,
		searchText
	}: {
		searchText: string,
		limit: number
	}
) => {
	const uid = useUserId() ?? undefined;
	const t = useTranslation();
	const dispatchToastMessage = useToastMessageDispatch();

	const searchMessages = useMethod('rocketchatSearch.search');
	return useQuery(
		['rooms', 'message-search', { uid, rid: searchText, limit }] as const,
		async () => {
			const result = await searchMessages(searchText, { uid }, { limit, searchAll: true });
			return result.message?.docs ?? [];
		},
		{
			keepPreviousData: true,
			onError: () => {
				dispatchToastMessage({
					type: 'error',
					message: t('Search_message_search_failed'),
				});
			},
		},
	);
}

const GlobalSearchList = forwardRef(({ onClose }: GlobalSearchListProps, ref) => {
	const listId = useUniqueId();
	const t = useTranslation();
	const pageSize = useSetting<number>('PageSize') ?? 10;
	const [limit, setLimit] = useState(pageSize);
	const [searchValue, setSearchValue] = useState('')
	const showUserAvatar = !!useUserPreference<boolean>('displayAvatars');
	const debouncedSearchValue = useDebouncedValue(searchValue, 500)

	const onChange = useMutableCallback((e) => {
		setSearchValue(e.currentTarget.value);
	});

	const cursorRef = useRef<HTMLInputElement>(null);
	const autofocus: Ref<HTMLInputElement> = useMergedRefs(useAutoFocus<HTMLInputElement>(), cursorRef);

	const listRef = useRef<VirtuosoHandle>(null);
	const boxRef = useRef<HTMLDivElement>(null);

	const selectedElement: MutableRefObject<HTMLElement | null | undefined> = useRef(null);
	const itemIndexRef = useRef(0);

	const placeholder = [t('Search'), shortcut].filter(Boolean).join(' ');

	const changeSelection = useMutableCallback((dir) => {
		let nextSelectedElement = null;

		if (dir === 'up') {
			nextSelectedElement = (selectedElement.current?.parentElement?.previousSibling as HTMLElement).querySelector('a');
		} else {
			nextSelectedElement = (selectedElement.current?.parentElement?.nextSibling as HTMLElement).querySelector('a');
		}

		if (nextSelectedElement) {
			toggleSelectionState(nextSelectedElement, selectedElement.current || undefined, cursorRef?.current || undefined);
			return nextSelectedElement;
		}
		return selectedElement.current;
	});

	const resetCursor = useMutableCallback(() => {
		itemIndexRef.current = 0;
		listRef.current?.scrollToIndex({ index: itemIndexRef.current });

		selectedElement.current = boxRef.current?.querySelector('a.rcx-sidebar-item');

		if (selectedElement.current) {
			toggleSelectionState(selectedElement.current, undefined, cursorRef?.current || undefined);
		}
	});

	const { data, isLoading } = useGlobalMessageSearchQuery({ searchText: debouncedSearchValue, limit });

	usePreventDefault(boxRef);

	useEffect(() => {
		resetCursor();
	});

	useEffect(() => {
		resetCursor();
	}, [searchValue, resetCursor]);

	useEffect(() => {
		if (!cursorRef?.current) {
			return;
		}
		return tinykeys(cursorRef?.current, {
			Escape: (event) => {
				event.preventDefault();
				setSearchValue((value) => {
					if (!value) {
						onClose();
					}
					resetCursor();
					return '';
				});
			},
			Tab: onClose,
			ArrowUp: () => {
				const currentElement = changeSelection('up');
				itemIndexRef.current = Math.max(itemIndexRef.current - 1, 0);
				listRef.current?.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			ArrowDown: () => {
				const currentElement = changeSelection('down');
				itemIndexRef.current = Math.min(itemIndexRef.current + 1, (data || []).length + 1);
				listRef.current?.scrollToIndex({ index: itemIndexRef.current });
				selectedElement.current = currentElement;
			},
			Enter: () => {
				if (selectedElement.current) {
					selectedElement.current.click();
				}
			},
		});
	}, [cursorRef, changeSelection, data?.length, onClose, resetCursor]);

	const handleClick: MouseEventHandler<HTMLElement> = (e): void => {
		if (e.target instanceof Element && [e.target.tagName, e.target.parentElement?.tagName].includes('BUTTON')) {
			return;
		}
		return onClose();
	};

	return (
		<Box
			position='absolute'
			rcx-sidebar
			h='full'
			display='flex'
			flexDirection='column'
			zIndex={99}
			w='full'
			className={css`
				left: 0;
				top: 0;
			`}
			ref={ref}
			role='search'
		>
			<Sidebar.TopBar.Section {...({ flexShrink: 0 } as any)} is='form'>
				<TextInput
					aria-owns={listId}
					data-qa='sidebar-search-input'
					ref={autofocus}
					value={searchValue}
					onChange={onChange}
					placeholder={placeholder}
					role='searchbox'
					addon={<Icon name='cross' size='x20' onClick={onClose} />}
				/>
			</Sidebar.TopBar.Section>
			<Box
				ref={boxRef}
				role='listbox'
				id={listId}
				tabIndex={-1}
				flexShrink={1}
				h='full'
				w='full'
				data-qa='sidebar-search-result'
				aria-live='polite'
				aria-atomic='true'
				aria-busy={isLoading}
				onClick={handleClick}
			>
				{data && (
					<>
						{data.length === 0 && (
							<Box p={24} color='annotation' textAlign='center' width='full'>
								{t('No_results_found')}
							</Box>
						)}
						{data.length > 0 && (
							<GlobalSearchListProvider>
								<Box is='section' display='flex' flexDirection='column' flexGrow={1} flexShrink={1} flexBasis='auto' height='full'>
									<Virtuoso
										totalCount={data.length}
										overscan={25}
										data={data}
										components={{ Scroller: ScrollableContentWrapper }}
										itemContent={(index, message) => {
											const previous = data[index - 1];

											const newDay = isMessageNewDay(message, previous);
											// const firstUnread = isMessageFirstUnread(subscription, message, previous);
											// const showDivider = newDay || firstUnread;

											const system = MessageTypes.isSystemMessage(message);

											// const unread = subscription?.tunread?.includes(message._id) ?? false;
											// const mention = subscription?.tunreadUser?.includes(message._id) ?? false;
											// const all = subscription?.tunreadGroup?.includes(message._id) ?? false;

											return (
												<Fragment key={message._id}>
													{/*{showDivider && (*/}
													{/*	<MessageDivider unreadLabel={firstUnread ? t('Unread_Messages').toLowerCase() : undefined}>*/}
													{/*		{newDay && formatDate(message.ts)}*/}
													{/*	</MessageDivider>*/}
													{/*)}*/}

													{system ? (
														<SystemMessage message={message} showUserAvatar={showUserAvatar} />
													) : (
														<SearchRow
															message={message}
															searchText={searchValue}
															showUserAvatar={showUserAvatar}
														/>
													)}
												</Fragment>
											);
										}}
										endReached={() => {
											setLimit((limit) => limit + pageSize);
										}}
									/>
								</Box>
							</GlobalSearchListProvider>
						)}
					</>
				)}
			</Box>
		</Box>
	);
});

export default GlobalSearchList;
