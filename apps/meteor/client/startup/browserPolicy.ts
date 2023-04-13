import { BrowserPolicy } from 'meteor/browser-policy'
BrowserPolicy.framing.allowAll()
BrowserPolicy.content.allowSameOriginForAll('*')
BrowserPolicy.content.allowDataUrlForAll('*')
BrowserPolicy.content.allowOriginForAll('*')
