import type { MessageAttachmentBase } from '@rocket.chat/core-typings';
import {
	MessageGenericPreview,
	MessageGenericPreviewContent,
	MessageGenericPreviewIcon,
	MessageGenericPreviewTitle,
	MessageGenericPreviewDescription,
} from '@rocket.chat/fuselage';
import { useMediaUrl } from '@rocket.chat/ui-contexts';
import type { FC } from 'react';
import React, { useState, useCallback } from 'react';

import { getFileExtension } from '../../../../../../lib/utils/getFileExtension';
import MarkdownText from '../../../../MarkdownText';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import AttachmentSize from '../structure/AttachmentSize';
import { AttachmentPreview } from '/client/components/message/content/attachments/structure/AttachmentPreview';

export const GenericFileAttachment: FC<MessageAttachmentBase> = ({
	title,
	description,
	descriptionMd,
	title_link: link,
	title_link_download: hasDownload,
	size,
	format,
	collapsed,
}) => {
	const getURL = useMediaUrl();
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const [uri, setUri] = useState<string>()

	const togglePreview = useCallback(() => {
		setIsPreviewOpen(prev => {
			if (!uri && !prev) setUri(link)
			return !prev
		})
	}, [uri, link])

	return (
		<>
			{descriptionMd ? <MessageContentBody md={descriptionMd} /> : <MarkdownText parseEmoji content={description} />}
			<MessageCollapsible
				title={title}
				hasDownload={hasDownload}
				link={link}
				format={format}
				isCollapsed={collapsed}
				togglePreview={togglePreview}
			>
				<MessageGenericPreview style={{ maxWidth: 368, width: '100%' }}>
					<MessageGenericPreviewContent
						thumb={<MessageGenericPreviewIcon name='attachment-file' type={format || getFileExtension(title)} />}
					>
						<MessageGenericPreviewTitle
							externalUrl={hasDownload && link ? getURL(link) : undefined}
							data-qa-type='attachment-title-link'
							download={hasDownload}
						>
							{title}
						</MessageGenericPreviewTitle>
						{size && (
							<MessageGenericPreviewDescription>
								<AttachmentSize size={size} wrapper={false} />
							</MessageGenericPreviewDescription>
						)}
					</MessageGenericPreviewContent>
				</MessageGenericPreview>
				<AttachmentPreview isOpened={isPreviewOpen} uri={uri} />
			</MessageCollapsible>
		</>
	);
};
