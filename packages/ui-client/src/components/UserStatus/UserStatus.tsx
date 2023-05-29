import { StatusBullet } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ComponentProps, ReactElement } from 'react';
import { memo } from 'react';

export type UserStatusProps = {
	small?: boolean;
	statusText?: string;
	statusEmoji?: { className: string, name: string, image: string, content: string }
} & ComponentProps<typeof StatusBullet>;

function UserStatus({ small, status, statusText, statusEmoji, ...props }: UserStatusProps): ReactElement {
	const size = small ? 'small' : 'large';
	const t = useTranslation();

	if (statusEmoji) {
		return <div style={{ width: '26px' }}>
			<span
				title={statusText}
				className={`${['rcx-message__emoji', statusEmoji.className].join(' ')} ${statusEmoji.name}`}
				style={{
					...(statusEmoji?.image && statusEmoji?.image.length ? { backgroundImage: statusEmoji.image } : {}),
				}}
			>
			{statusEmoji.content}
		</span>
		</div>
	}

	switch (status) {
		case 'online':
			return <StatusBullet size={size} status={status} title={statusText || t('Online')} {...props} />;
		case 'busy':
			return <StatusBullet size={size} status={status} title={statusText || t('Busy')} {...props} />;
		case 'away':
			return <StatusBullet size={size} status={status} title={statusText || t('Away')} {...props} />;
		case 'offline':
			return <StatusBullet size={size} status={status} title={statusText || t('Offline')} {...props} />;
		case 'disabled':
			return <StatusBullet size={size} status={status} title={statusText || t('Disabled')} {...props} />;
		default:
			return <StatusBullet size={size} title={t('Loading')} {...props} />;
	}
}

export default memo(UserStatus);
