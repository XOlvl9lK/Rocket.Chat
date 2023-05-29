import React, { MouseEventHandler, useMemo } from 'react';
import { Box, MessageEmoji, Icon } from '@rocket.chat/fuselage';
import { detectEmoji } from '/client/lib/utils/detectEmoji';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { EmojiPicker } from '/app/emoji';

type EmojiStatusProps = {
	statusEmoji?: string
	setStatusEmoji: (emoji: string) => void
}

export const EmojiStatus = ({ statusEmoji, setStatusEmoji }: EmojiStatusProps) => {
	const openEmojiPicker: MouseEventHandler<HTMLElement> = useMutableCallback((e) => {
		e.stopPropagation();
		e.preventDefault();

		if (EmojiPicker.isOpened()) {
			EmojiPicker.close();
			return;
		}

		EmojiPicker.open(e.currentTarget, (emoji: string) => setStatusEmoji(` :${emoji}: `));
	})

	const [emojiResult] = useMemo(() => {
		if (!statusEmoji) return []
		return detectEmoji(statusEmoji)
	}, [statusEmoji])

	return (
		<Box
			is='button'
			type='button'
			rcx-button
			rcx-button--icon
			rcx-button--square
			rcx-button--small-square
			w='30px'
			h='24px'
			color='hint'
			display='flex'
			justifyContent='center'
			alignItems='center'
			overflow='hidden'
			mie='12px'
			onClick={openEmojiPicker}
		>
			{emojiResult ?
				<MessageEmoji className={emojiResult.className} name={emojiResult.name} image={emojiResult.image}>
					{emojiResult.content}
				</MessageEmoji>
				:
				<Icon name='emoji' size='x20' />
			}
		</Box>
	);
};
