import React, { useMemo } from 'react';
import { getFileExtension } from '/lib/utils/getFileExtension';
import Action from '../../../content/Action'

type AttachmentPreviewProps = {
	format?: string
	title?: string
	togglePreview?: () => void
}

const availableForPreviewFormats = [
	'doc',
	'docx',
	'odt',
	'pdf',
	'rtf',
	'xls',
	'xlsx',
	'ppt',
	'pptx',
	'psd',
	'ttf',
	'txt',
	'html',
	'xml'
]

export const AttachmentPreviewAction = ({ togglePreview, title, format }: AttachmentPreviewProps) => {
	const isPreviewAvailable = useMemo(() => availableForPreviewFormats.includes((format || getFileExtension(title)).toLowerCase()), [format, title])

	return isPreviewAvailable ?
		<Action icon='eye' onClick={togglePreview} />
		:
		null;
};
