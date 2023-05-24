import { Dropdown, IconButton, Option, OptionContent, OptionIcon, OptionTitle } from '@rocket.chat/fuselage';
import React, { useRef } from 'react';
import { useDropdownVisibility } from '/client/sidebar/header/hooks/useDropdownVisibility';
import { ComposerAPI } from '/client/lib/chats/ChatAPI';

type MultilineActionsToolbarDropdown = {
	composer: ComposerAPI
}

export const MultilineActionsToolbarDropdown = ({ composer }: MultilineActionsToolbarDropdown) => {

	const reference = useRef(null);
	const target = useRef(null);

	const { isVisible, toggle } = useDropdownVisibility({ reference, target });

	return <>
		<IconButton
			data-qa-id='menu-more-actions'
			small
			ref={reference}
			icon='multiline'
			onClick={() => toggle()}
			title='Multi line'
		/>
		{isVisible && (
			<Dropdown reference={reference} ref={target} placement='bottom-start'>
				{multilineCodeSnippets.map((snippet, idx) =>
					<Option key={idx} onClick={() => {
						composer.wrapSelection(snippet.pattern)
						toggle()
					}}>
						<OptionContent>{snippet.label}</OptionContent>
					</Option>
				)}
			</Dropdown>
		)}
	</>
}

type CodeSnippetOption = {
	label: string
	pattern: string
}

const multilineCodeSnippets: CodeSnippetOption[] = [
	{
		label: 'Java',
		pattern: '```java\n{{text}}\n``` ',
	},
	{
		label: 'JavaScript',
		pattern: '```js\n{{text}}\n``` ',
	},
	{
		label: 'Python',
		pattern: '```python\n{{text}}\n``` ',
	},
	{
		label: 'Xml',
		pattern: '```xml\n{{text}}\n``` ',
	},
	{
		label: 'Plain',
		pattern: '```\n{{text}}\n``` ',
	}
]
