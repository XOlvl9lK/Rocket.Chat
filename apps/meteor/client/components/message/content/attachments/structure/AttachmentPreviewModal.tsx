import React, { useMemo, useEffect, useState } from 'react';
import { Modal, IconButton, Box, Margins } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import { imperativeModal } from '/client/lib/imperativeModal';

type AttachmentPreviewProps = {
	uri?: string
	format: string
}

const GOOGLE_DOCS_VIEWER = 'https://docs.google.com/gview?embedded=true'

const getSrc = (uri: string) => {
	const fileLink = uri.includes('http') || uri.includes('https') ? uri : window.location.origin + uri
	return GOOGLE_DOCS_VIEWER + `&url=${fileLink}`
}

export const AttachmentPreviewModal = ({ uri, format }: AttachmentPreviewProps) => {
	const t = useTranslation();
	const [sql, setSql] = useState('')
	const isSql = format.toLowerCase() === 'sql'
	const src = useMemo(() => {
		if (!uri) return;
		return getSrc(uri)
	}, [uri])

	useEffect(() => {
		const dialog = document.querySelector('dialog') as HTMLDialogElement
		if (dialog) {
			dialog.style.maxWidth = 'none'
		}
	}, [])

	useEffect(() => {
		(async () => {
			if (uri && isSql) {
				const decoder = new TextDecoder('utf-8')
				const result = await fetch(window.location.origin + uri).then(res => res.arrayBuffer())
				const decoded = decoder.decode(new Uint8Array(result))
				setSql(decoded)
			}
		})()
	}, [uri, isSql])

	return (
		<Modal w='70vw'>
			<Modal.Header>
				<Box display='flex' alignItems='end' justifyContent='space-between' w='100%'>
					<Modal.Title>{t('Preview')}</Modal.Title>
					<Margins display='flex' alignItems='center' inline='x4'>
						<IconButton
							icon='cloud-arrow-down'
							small
							title={t('Download')}
							is='a'
							href={`${uri}?download`}
							target='_blank'
							rel='noopener noreferrer'
							download
						/>
						<Modal.Close onClick={() => imperativeModal.close()} title={t('Close')} />
					</Margins>
				</Box>
			</Modal.Header>
			<Modal.Content>
				<div className='attachment-preview'>
					{isSql ?
						sql && <SqlPreview sql={sql} />
						:
						src && <iframe
							src={src}
							allow='clipboard-read; clipboard-write'
						/>
					}
				</div>
			</Modal.Content>
			<Modal.Footer></Modal.Footer>
		</Modal>
	);
};

type SqlPreviewProps = {
	sql: string
}

const SqlPreview = ({ sql }: SqlPreviewProps) => {
	return <div style={{ whiteSpace: "pre-wrap", padding: '10px', backgroundColor: '#c6c6c6' }}>
		<div style={{ backgroundColor: 'white', padding: '5px' }}>
			{sql}
		</div>
	</div>
}
