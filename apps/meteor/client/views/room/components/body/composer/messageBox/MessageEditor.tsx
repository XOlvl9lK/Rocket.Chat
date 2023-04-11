import { Editor } from '@tinymce/tinymce-react';
import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { css } from '@rocket.chat/css-in-js';

import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/link';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/code';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/bbcode';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/contextmenu';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/fullpage';
import 'tinymce/plugins/help';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/legacyoutput';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/paste';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/print';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/spellchecker';
import 'tinymce/plugins/tabfocus';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/textpattern';
import 'tinymce/plugins/toc';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';
import 'tinymce/skins/ui/oxide/skin.min.css';
import 'tinymce/skins/ui/oxide/content.min.css';
import 'tinymce/skins/content/default/content.min.css';

// chars count editorRef.current?.plugins.wordcount.body.getCharacterCount()

export type EditorManager = {
	isEmpty: (notify?: boolean) => boolean
	getContent: () => string
	clear: () => void
	setContent: (content: string) => void
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

	useImperativeHandle(ref, () => ({ isEmpty, getContent, clear, setContent }))

	return <div style={{ width: '100%', display: isVisible ? 'block' : 'none' }}>
		<Editor
			onInit={(evt, editor) => editorRef.current = editor}
			initialValue=''
			init={{
				skin: false,
				content_css: false,
				height: 250,
				menubar: 'file edit view insert format tools table help',
				plugins: 'print preview paste importcss searchreplace autolink directionality code visualblocks visualchars link template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount textpattern noneditable help charmap quickbars emoticons',
				toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | preview print | template link anchor codesample | ltr rtl',
				content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
				resize: false,
				branding: false,
				autosave_ask_before_unload: false,
				width: '100%',
			}}
			onChange={e => {
				console.log('change', e);
			}}
		/>
	</div>
})
