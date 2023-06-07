import type * as UiKit from '@rocket.chat/ui-kit';
import { useTranslation, useUserId } from '@rocket.chat/ui-contexts';
import {
  VideoConfMessageSkeleton,
  VideoConfMessage,
  VideoConfMessageRow,
  VideoConfMessageIcon,
  VideoConfMessageText,
  VideoConfMessageFooter,
  VideoConfMessageUserStack,
  VideoConfMessageFooterText,
  VideoConfMessageButton,
  VideoConfMessageContent,
  VideoConfMessageActions,
  VideoConfMessageAction,
  VideoConfMessageFooterButtons,
} from '@rocket.chat/ui-video-conf';
import type { MouseEventHandler, ReactElement } from 'react';
import { useContext, memo, useCallback } from 'react';
import { Box } from '@rocket.chat/fuselage';

import { useSurfaceType } from '../../contexts/SurfaceContext';
import type { BlockProps } from '../../utils/BlockProps';
import { useVideoConfDataStream } from './hooks/useVideoConfDataStream';
import { kitContext } from '../..';

type VideoConferenceBlockProps = BlockProps<UiKit.VideoConferenceBlock>;

const MAX_USERS = 6;

const VideoConferenceBlock = ({
  block,
}: VideoConferenceBlockProps): ReactElement => {
  const t = useTranslation();
  const { callId, appId = 'videoconf-core' } = block;
  const surfaceType = useSurfaceType();
  const userId = useUserId();

  const { action, viewId, rid } = useContext(kitContext);

  if (surfaceType !== 'message') {
    return <></>;
  }

  if (!callId || !rid) {
    return <></>;
  }

  const result = useVideoConfDataStream({ rid, callId });

  const joinHandler: MouseEventHandler<HTMLButtonElement> = (e): void => {
    action(
      {
        blockId: block.blockId || '',
        appId,
        actionId: 'join',
        value: block.blockId || '',
        viewId,
      },
      e
    );
  };

  const inviteHandler: MouseEventHandler<HTMLButtonElement> = useCallback((e): void => {
    action(
      {
        blockId: block.blockId || '',
        appId,
        actionId: 'invite',
        value: block.callId || '',
        viewId,
      },
      e
    )
  }, []);

  const callAgainHandler: MouseEventHandler<HTMLButtonElement> = useCallback((e): void => {
    action(
      {
        blockId: rid || '',
        appId,
        actionId: 'callBack',
        value: rid || '',
        viewId,
      },
      e
    );
  }, []);

  const openCallInfo: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    action(
      {
        blockId: callId,
        appId,
        actionId: 'info',
        value: rid,
        viewId,
      },
      e
    );
  }, []);

  if (result.isSuccess) {
    const { data } = result;
    const isUserCaller = data.createdBy._id === userId;

    if ('endedAt' in data) {
      return (
        <VideoConfMessage>
          <VideoConfMessageRow>
            <VideoConfMessageContent>
              <VideoConfMessageIcon />
              <VideoConfMessageText>{t('Call_ended')}</VideoConfMessageText>
            </VideoConfMessageContent>
            <VideoConfMessageActions>
              <VideoConfMessageAction icon='info' onClick={openCallInfo} />
            </VideoConfMessageActions>
          </VideoConfMessageRow>
          <VideoConfMessageFooter>
            {data.type === 'direct' && (
              <>
                <VideoConfMessageButton onClick={callAgainHandler}>
                  {isUserCaller ? t('Call_again') : t('Call_back')}
                </VideoConfMessageButton>
                <VideoConfMessageFooterText>
                  {t('Call_was_not_answered')}
                </VideoConfMessageFooterText>
              </>
            )}
            {data.type !== 'direct' &&
              (data.users.length ? (
                <>
                  <VideoConfMessageUserStack users={data.users} />
                  <VideoConfMessageFooterText>
                    {data.users.length > MAX_USERS
                      ? t('__usersCount__member_joined', {
                          usersCount: data.users.length - MAX_USERS,
                        })
                      : t('Joined')}
                  </VideoConfMessageFooterText>
                </>
              ) : (
                <VideoConfMessageFooterText>
                  {t('Call_was_not_answered')}
                </VideoConfMessageFooterText>
              ))}
          </VideoConfMessageFooter>
        </VideoConfMessage>
      );
    }

    if (data.type === 'direct' && data.status === 0) {
      return (
        <VideoConfMessage>
          <VideoConfMessageRow>
            <VideoConfMessageContent>
              <VideoConfMessageIcon variant='incoming' />
              <VideoConfMessageText>{t('Calling')}</VideoConfMessageText>
            </VideoConfMessageContent>
            <VideoConfMessageActions>
              <VideoConfMessageAction icon='info' onClick={openCallInfo} />
            </VideoConfMessageActions>
          </VideoConfMessageRow>
          <VideoConfMessageFooter>
            <VideoConfMessageFooterText>
              {t('Waiting_for_answer')}
            </VideoConfMessageFooterText>
          </VideoConfMessageFooter>
        </VideoConfMessage>
      );
    }

    return (
      <VideoConfMessage>
        <VideoConfMessageRow>
          <VideoConfMessageContent>
            <VideoConfMessageIcon variant='outgoing' />
            <VideoConfMessageText>{t('Call_ongoing')}</VideoConfMessageText>
          </VideoConfMessageContent>
          <VideoConfMessageActions>
            <VideoConfMessageAction icon='info' onClick={openCallInfo} />
          </VideoConfMessageActions>
        </VideoConfMessageRow>
        <VideoConfMessageFooter>
          <VideoConfMessageFooterButtons>
            <VideoConfMessageButton primary onClick={joinHandler}>
              {t('Join')}
            </VideoConfMessageButton>
            <VideoConfMessageButton primary onClick={inviteHandler}>
              {t('Invite_to_call')}
            </VideoConfMessageButton>
          </VideoConfMessageFooterButtons>
          {Boolean(data.users.length) && (
            <Box margin='5px 0 0 0' display='flex' alignItems='center'>
              <VideoConfMessageUserStack users={data.users} />
              <VideoConfMessageFooterText>
                {data.users.length > MAX_USERS
                  ? t('__usersCount__member_joined', {
                    usersCount: data.users.length - MAX_USERS,
                  })
                  : t('Joined')}
              </VideoConfMessageFooterText>
            </Box>
          )}
          {data.dismissers?.map(dismisser => {
            return <Box key={dismisser.username} fontScale='c1' mi='x4' margin='5px 0 0 0'>
              {t('Dismisses_Users', { username: dismisser.username })}
            </Box>
          })}
        </VideoConfMessageFooter>
      </VideoConfMessage>
    );
  }

  return <VideoConfMessageSkeleton />;
};

export default memo(VideoConferenceBlock);
