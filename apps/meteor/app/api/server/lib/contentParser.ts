const pdf = require('pdf-parse');
const officeParser = require('officeparser');
import { read, utils } from 'xlsx';

interface IContentParser {
	fileBuffer: Buffer
	parse: () => Promise<string>
}

abstract class ContentParser implements IContentParser {
	protected readonly MAX_CONTENT_MBYTES_LENGTH = 2
	protected readonly MAX_MBYTES_FILE_SIZE = 50

	protected constructor(public fileBuffer: Buffer) {}

	abstract getContent(): Promise<string> | string

	async parse() {
		if (this.isFileTooLarge()) return ''
		const content = (await this.getContent()) as string
		const mByteLength = this.toMBytes(Buffer.byteLength(content, 'utf8'))
		if (mByteLength > this.MAX_CONTENT_MBYTES_LENGTH) return ''
		return content
	}

	protected isFileTooLarge() {
		return this.toMBytes(this.fileBuffer.length) > this.MAX_MBYTES_FILE_SIZE
	}

	protected toMBytes(bytes: number) {
		return (bytes / 1024) / 1024
	}
}

class TextContentParser extends ContentParser {
	constructor(fileBuffer: Buffer) {
		super(fileBuffer)
	}

	async getContent() {
		return this.fileBuffer.toString()
	}
}

class PdfContentParser extends ContentParser {
	constructor(fileBuffer: Buffer) {
		super(fileBuffer)
	}

	async getContent() {
		const data = await pdf(this.fileBuffer)
		return data.text
	}
}

class OfficeContentParser extends ContentParser {
	constructor(fileBuffer: Buffer) {
		super(fileBuffer)
	}

	async getContent() {
		return officeParser.parseOfficeAsync(this.fileBuffer)
	}
}

class XlsContentParser extends ContentParser {
	constructor(fileBuffer: Buffer) {
		super(fileBuffer)
	}

	private readBuffer() {
		return read(this.fileBuffer, { type: 'buffer' })
	}

	async getContent() {
		const wb = this.readBuffer()
		let content = ''
		Object.values(wb.Sheets).forEach(worksheet => {
			Object.entries(worksheet).forEach(([key, value]) => {
				if (!key.includes('!')) {
					content += ` ${value.v}`
				}
			})
		})
		return content
	}
}

class FakeContentParser extends ContentParser {
	constructor(fileBuffer: Buffer) {
		super(fileBuffer)
	}

	async getContent() {
		return ''
	}
}

export const getContentParser = (type: string, fileBuffer: Buffer): IContentParser => {
	const getParserConstructor = (): new (fileBuffer: Buffer) => IContentParser => {
		switch (type) {
			case 'text/plain':
			case 'text/cmd':
			case 'text/css':
			case 'text/csv':
			case 'text/html':
			case 'text/xml':
			case 'application/json':
				return TextContentParser
			case 'application/pdf':
				return PdfContentParser
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
			case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
				return OfficeContentParser
			case 'application/vnd.ms-excel':
				return XlsContentParser
			default:
				return FakeContentParser
		}
	}

	const constructor = getParserConstructor()

	return new constructor(fileBuffer)
}
