import type { IMessage, FileAttachmentProps } from '@rocket.chat/core-typings';

export const assignEnglishLanguage = (input: IMessage | FileAttachmentProps) => {
	const russianRegexp = /[а-яА-я]/
	let isOnlyEnglishPresent = false
	if ('msg' in input) {
		isOnlyEnglishPresent = !russianRegexp.test(input.msg)
	} else {
		isOnlyEnglishPresent = !russianRegexp.test(input.fileContent) &&
			!russianRegexp.test(input.title) &&
			!russianRegexp.test(input.description)
	}

	if (isOnlyEnglishPresent) {
		input.language = 'english'
	}
}
