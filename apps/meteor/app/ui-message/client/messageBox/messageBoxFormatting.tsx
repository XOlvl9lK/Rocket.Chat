import type { Icon } from '@rocket.chat/fuselage';
import type { TranslationKey } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactNode } from 'react';
import React from 'react';

import { settings } from '../../../settings/client';
import { ComposerAPI } from '/client/lib/chats/ChatAPI';
import {
	MultilineActionsToolbarDropdown
} from '/client/views/room/components/body/composer/messageBox/MessageBoxActionsToolbar/MultilineActionsToolbarDropdown';

export type FormattingButton =
	| {
			label: TranslationKey;
			icon: ComponentProps<typeof Icon>['name'];
			pattern: string;
			// text?: () => string | undefined;
			command?: string;
			link?: string;
			condition?: () => boolean;
	  }
	| {
			label: TranslationKey;
			text: () => string | undefined;
			link: string;
			condition?: () => boolean;
	  }
	|	{
			label: TranslationKey;
			render: (composer: ComposerAPI) => ReactNode;
			condition?: () => boolean;
		};

export const formattingButtons: ReadonlyArray<FormattingButton> = [
	{
		label: 'Bold',
		icon: 'bold',
		pattern: '*{{text}}*',
		command: 'b',
	},
	{
		label: 'Italic',
		icon: 'italic',
		pattern: '_{{text}}_',
		command: 'i',
	},
	{
		label: 'Strike',
		icon: 'strike',
		pattern: '~{{text}}~',
	},
	{
		label: 'Inline_code',
		icon: 'code',
		pattern: '`{{text}}`',
	},
	{
		label: 'Multi_line',
		render: (composer) => <MultilineActionsToolbarDropdown composer={composer} />
	},
	{
		label: 'KaTeX' as TranslationKey,
		icon: 'katex',
		text: () => {
			if (!settings.get('Katex_Enabled')) {
				return;
			}
			if (settings.get('Katex_Dollar_Syntax')) {
				return '$$KaTeX$$';
			}
			if (settings.get('Katex_Parenthesis_Syntax')) {
				return '\\[KaTeX\\]';
			}
		},
		link: 'https://khan.github.io/KaTeX/function-support.html',
		condition: () => settings.get('Katex_Enabled'),
	},
] as const;
