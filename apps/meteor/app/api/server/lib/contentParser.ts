const pdf = require('pdf-parse');
const officeParser = require('officeparser');
const textract = require('textract');

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

export const getContentParser = (type: string, fileBuffer: Buffer): IContentParser => {

	switch (type) {
		case 'text/plain':
		case 'text/cmd':
		case 'text/css':
		case 'text/csv':
		case 'text/html':
		case 'text/xml':
		case 'application/json':
			return new TextContentParser(fileBuffer)
		case 'application/pdf':
			return new PdfContentParser(fileBuffer)
		case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
		case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
			return new OfficeContentParser(fileBuffer)
		default:
			return {
				fileBuffer,
				parse: async () => ''
			}
	}
}
