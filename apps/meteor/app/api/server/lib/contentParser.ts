const pdf = require('pdf-parse');
const officeParser = require('officeparser');
import { read, utils } from 'xlsx';

interface IContentParser {
	fileBuffer: Buffer
	parse: () => Promise<string>
}

class TextContentParser implements IContentParser {
	constructor(private fileBuffer: Buffer) {}

	async parse() {
		return this.fileBuffer.toString()
	}
}

class PdfContentParser implements IContentParser {
	constructor(private fileBuffer: Buffer) {}

	async parse() {
		const data = await pdf(this.fileBuffer)
		return data.text
	}
}

class OfficeContentParser implements IContentParser {
	constructor(private fileBuffer: Buffer) {}

	async parse() {
		return officeParser.parseOfficeAsync(this.fileBuffer)
	}
}

class XlsContentParser implements IContentParser {
	constructor(private fileBuffer: Buffer) {}

	private readBuffer() {
		return read(this.fileBuffer, { type: 'buffer' })
	}

	async parse() {
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

class FakeContentParser implements IContentParser {
	constructor(private fileBuffer: Buffer) {}

	async parse() {
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
