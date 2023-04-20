import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import { useEffectOnce } from '/client/hooks/useEffectOnce';

// chars count editorRef.current?.plugins.wordcount.body.getCharacterCount()

export type EditorManager = {
	isEmpty: (notify?: boolean) => boolean
	getContent: () => string
	clear: () => void
	setContent: (content: string) => void
	initializeContent: (content: string) => void
}

type MessageEditorProps = {
	isVisible: boolean
}

export const MessageEditor = forwardRef(({ isVisible }: MessageEditorProps, ref) => {
	const editorRef = useRef<any>(null);

	const isEmpty = useCallback((notify?: boolean) => {
		const count = editorRef.current?.plugins.wordcount.getCount();
		if (!count && notify) {
			editorRef.current?.notificationManager.open({
				text: 'Сообщение пустое',
				type: 'error'
			});
		}
		return !count
	}, []);

	const getContent = useCallback(() => {
		return editorRef.current?.getContent();
	}, []);

	const clear = useCallback(() => {
		editorRef.current?.setContent('')
	}, [])

	const setContent = useCallback((content: string) => {
		editorRef.current?.setContent(content)
	}, [])

	const initializeContent = useCallback((content: string) => {
		if (!editorRef.current?.getContent()) {
			setContent(content)
		}
	}, [])

	useImperativeHandle(ref, () => ({ isEmpty, getContent, clear, setContent, initializeContent }))

	useEffectOnce(Boolean(editorRef.current), () => {
		editorRef.current?.iframeElement.removeAttribute('title')
	}, [editorRef.current])

	return <Box
		className={css`
			width: 100%;
			display: ${isVisible ? 'block' : 'none'};
		`}
	>
		<Editor
			onInit={(evt, editor) => editorRef.current = editor}
			initialValue=''
			apiKey='khlkfnfzk8g83f0ynbiap78i3bl4tiii94nkekasqzy2ztot'
			init={{
				content_css: false,
				height: 250,
				menubar: 'file edit view insert format tools table help',
				plugins: 'print preview paste importcss searchreplace autolink directionality code visualblocks visualchars link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern noneditable help charmap quickbars emoticons',
				toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | preview print | template link anchor codesample | ltr rtl',
				content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
				contextmenu: false,
				resize: true,
				branding: false,
				autosave_ask_before_unload: false,
				width: '100%',
				toolbar_mode: 'sliding',
			}}
		/>
	</Box>
})
