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
import React, { useState, useCallback, useMemo } from 'react';

import { getFileExtension } from '../../../../../../lib/utils/getFileExtension';
import MarkdownText from '../../../../MarkdownText';
import MessageCollapsible from '../../../MessageCollapsible';
import MessageContentBody from '../../../MessageContentBody';
import AttachmentSize from '../structure/AttachmentSize';
import { AttachmentPreviewModal } from '/client/components/message/content/attachments/structure/AttachmentPreviewModal';
import { imperativeModal } from '/client/lib/imperativeModal';
import {
	availableForPreviewFormats
} from '/client/components/message/content/attachments/structure/AttachmentPreviewAction';

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

	const isPreviewAvailable = useMemo(() => availableForPreviewFormats.includes((format || getFileExtension(title)).toLowerCase()), [format, title])

	const togglePreview = useCallback(() => {
		imperativeModal.open({
			component: AttachmentPreviewModal,
			props: { uri: link, format: format || getFileExtension(title) }
		})
	}, [link])

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
						{isPreviewAvailable ?
							<span
								className='rcx-message-generic-preview__title attachment-preview-title'
								onClick={togglePreview}
							>
								{title}
							</span>
							:
							<MessageGenericPreviewTitle
								externalUrl={hasDownload && link ? getURL(link) : undefined}
								data-qa-type='attachment-title-link'
								download={hasDownload}
							>
								{title}
							</MessageGenericPreviewTitle>
						}
						{size && (
							<MessageGenericPreviewDescription>
								<AttachmentSize size={size} wrapper={false} />
							</MessageGenericPreviewDescription>
						)}
					</MessageGenericPreviewContent>
				</MessageGenericPreview>
			</MessageCollapsible>
		</>
	);
};
