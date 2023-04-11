import { usePermission } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import HtmlParser from 'react-html-parser';
import { Icon } from '@rocket.chat/fuselage';

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
import 'tinymce/plugins/autosave';
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
import 'tinymce/plugins/save';
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


import NotAuthorizedPage from '../../../notAuthorized/NotAuthorizedPage';
import UsersTable from './UsersTable';

const UsersTab = (props: { workspace?: 'external' | 'local' }): ReactElement => {
	const canViewOutsideRoom = usePermission('view-outside-room');
	const canViewDM = usePermission('view-d-room');

	const [parsed, setParsed] = useState('')

	// if (canViewOutsideRoom && canViewDM) {
	// 	return <UsersTable {...props} />;
	// }

	// return <NotAuthorizedPage />;

	const editorRef = useRef(null);
	const log = () => {
		if (editorRef.current) {
			console.log(editorRef.current);
			setParsed(editorRef.current.getContent())
		}
	};

	return <>
		<Editor
			onInit={(evt, editor) => editorRef.current = editor}
			initialValue="<p>This is the initial content of the editor.</p>"
			init={{
				skin: false,
				content_css: false,
				height: 500,
				menubar: 'file edit view insert format tools table help',
				plugins: 'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
				toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
				content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
			}}
		/>
		<button onClick={log}>Log editor content</button>
		<h2>Parsed</h2>
		<div>
			{HtmlParser(parsed)}
		</div>
		<div>
			<Icon name='reload' />
			<Icon name='queue' />
			<Icon name='permalink' />
			<Icon name='omnichannel' />
			<Icon name='menu' />
			<Icon name='map-pin' />
			<Icon name='info-circled' />
			<Icon name='jump' />
			<Icon name='jump-to-message' />
			<Icon name='game' />
			<Icon name='edit' />
			<Icon name='discussion' />
			<Icon name='discover' />
			<Icon name='contact' />
			<Icon name='contact' />
		</div>
	</>
};


export default UsersTab;
