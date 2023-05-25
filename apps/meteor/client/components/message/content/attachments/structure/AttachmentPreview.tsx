import React, { useMemo } from 'react';
import { Collapse } from 'react-collapse';

type AttachmentPreviewProps = {
	isOpened: boolean
	uri?: string
}

const GOOGLE_DOCS_VIEWER = 'https://docs.google.com/gview?embedded=true'

const getSrc = (uri: string) => {
	const fileLink = uri.includes('http') || uri.includes('https') ? uri : window.location.origin + uri
	return GOOGLE_DOCS_VIEWER + `&url=${fileLink}`
}

export const AttachmentPreview = ({ isOpened, uri }: AttachmentPreviewProps) => {
	const src = useMemo(() => {
		if (!uri) return;
		return getSrc(uri)
	}, [uri])

	return (
		<div className='attachment-preview'>
			<Collapse isOpened={isOpened}>
				{src &&
					<iframe
						src={src}
					/>
				}
			</Collapse>
		</div>
	);
};
