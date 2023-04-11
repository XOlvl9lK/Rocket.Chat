import type { IThreadMainMessage } from '@rocket.chat/core-typings';
import React, { useMemo } from 'react';

import { normalizeThreadTitle } from '../../../../../../app/threads/client/lib/normalizeThreadTitle';
import VerticalBar from '../../../../../components/VerticalBar';

type ThreadTitleProps = {
	mainMessage: IThreadMainMessage;
};

const ThreadTitle = ({ mainMessage }: ThreadTitleProps) => {
	const innerHTML = useMemo(() => ({ __html: normalizeThreadTitle(mainMessage) }), [mainMessage]);
	const isEditor = useMemo(() => mainMessage?.t === 'editor', [mainMessage]);

	return isEditor ?
		<VerticalBar.Text>{mainMessage?.u.username}</VerticalBar.Text>
		:
		<VerticalBar.Text dangerouslySetInnerHTML={innerHTML} />;
};

export default ThreadTitle;
