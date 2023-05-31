import { Users } from '@rocket.chat/models';
import { api } from '@rocket.chat/core-services';
import { Meteor } from 'meteor/meteor';

type ScheduleUserStatusChangeProps = {
	userId: string
	period: [string, string]
	status: string
	statusText?: string
	statusEmoji?: string

}

export const scheduleUserStatusChange = async ({ period, ...params }: ScheduleUserStatusChangeProps) => {
	if (!period?.[0] || !period?.[1]) {
		return changeStatus(params)
	}

	const start = new Date(period[0])
	const end = new Date(period[1])
	const now = new Date()

	if (end < start || end < now) return

	if (start <= now) {
		await changeStatus(params)
	} else {
		const startTimeout = start.getTime() - now.getTime()
		Meteor.setTimeout(async () => {
			await changeStatus(params)
		}, startTimeout)
	}

	const endTimeout = end.getTime() - now.getTime()
	Meteor.setTimeout(async () => {
		await changeStatus({ userId: params.userId, statusText: '', statusEmoji: null, status: 'online' })
	}, endTimeout)
}

type ChangeStatusProps = {
	userId: string
	status: string
	statusText?: string
	statusEmoji?: string
}

const changeStatus = async ({ statusEmoji, statusText, status, userId }: ChangeStatusProps) => {
	const user = await Users.findOneById(userId)
	const customStatuses = user.customStatuses || []

	if (statusEmoji || statusText) {
		const isCustomStatusAlreadySaved = customStatuses.find(s => s.status === status && s.statusText === statusText && s.statusEmoji === statusEmoji)
		if (!isCustomStatusAlreadySaved) {
			if (customStatuses.length >= 10) customStatuses.shift()
			customStatuses.push({
				statusText,
				statusEmoji,
				status
			})
		}
	}

	await Users.updateOne(
		{ _id: userId },
		{
			$set: {
				status,
				statusDefault: status,
				statusEmoji: statusEmoji || null,
				statusText,
				customStatuses,
			}
		}
	)

	const updatedUser = await Users.findOneById(userId)

	const { _id, username, roles, name, isOnCall } = updatedUser;

	void api.broadcast('presence.status', {
		user: { status, _id, username, statusText, roles, name, isOnCall, statusEmoji },
		previousStatus: user.status,
	});
}
