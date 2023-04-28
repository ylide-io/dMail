// @ts-ignore
// eslint-disable-next-line simple-import-sort/imports
import List from '@editorjs/list';
import Header from '@editorjs/header';
import { nanoid } from 'nanoid';
import { OutputData } from '@editorjs/editorjs';
import { IMessageDecodedContent, IMessageDecodedTextData, MessageDecodedTextDataType } from '../indexedDB/IndexedDB';
import {
	IGenericAccount,
	IMessage,
	IMessageAttachmentLinkV1,
	IYMFTagNode,
	MessageContainer,
	MessageContentV4,
	YMF,
} from '@ylide/sdk';
import { generatePath, useLocation } from 'react-router-dom';
import { useNav } from './url';
import { globalOutgoingMailData, OutgoingMailData } from '../stores/outgoingMailData';
import { RoutePath } from '../stores/routePath';
import { browserStorage } from '../stores/browserStorage';
import { WidgetId } from '../pages/widgets/widgets';
import { showStaticComponent } from '../components/staticComponentManager/staticComponentManager';
import {
	COMPOSE_MAIL_POPUP_SINGLETON_KEY,
	ComposeMailPopup,
} from '../pages/mail/components/composeMailPopup/composeMailPopup';
import { invariant } from './assert';
import domain from '../stores/Domain';

async function getMessageContent(msg: IMessage) {
	const content = await domain.ylide.core.getMessageContent(msg);
	invariant(content && !content.corrupted, 'Content is not available or corrupted');
	return content;
}

export async function decodeMessage(
	msgId: string,
	msg: IMessage,
	recipient: IGenericAccount,
): Promise<IMessageDecodedContent> {
	const content = await getMessageContent(msg);

	const result = msg.isBroadcast
		? domain.ylide.core.decryptBroadcastContent(msg, content)
		: await domain.ylide.core.decryptMessageContent(recipient, msg, content);

	return {
		msgId,
		decodedSubject: result.content.subject,
		decodedTextData:
			result.content.content instanceof YMF
				? {
						type: MessageDecodedTextDataType.YMF,
						value: result.content.content,
				  }
				: {
						type: MessageDecodedTextDataType.PLAIN,
						value: result.content.content,
				  },
		attachments:
			result.content instanceof MessageContentV4
				? (result.content.attachments as unknown as IMessageAttachmentLinkV1[])
				: [],
	};
}

export async function decodeAttachment(data: Uint8Array, msg: IMessage, recipient: IGenericAccount) {
	const content = await getMessageContent(msg);
	const unpackedContainer = MessageContainer.unpackContainter(content.content);
	const secureContext = await domain.ylide.core.getMessageSecureContext(recipient, msg, unpackedContainer);
	return secureContext.decrypt(data);
}

//

export const EDITOR_JS_TOOLS = {
	list: List,
	header: Header,
};

function decodeEditorJsData(data: string): OutputData | undefined {
	try {
		const json = JSON.parse(data);

		// Qamon message
		if (!json?.blocks && json.body) {
			return {
				time: 1676587472156,
				blocks: [{ id: '2cC8_Z_Rad', type: 'paragraph', data: { text: json.body } }],
				version: '2.26.5',
			};
		}

		invariant(json.blocks);
		return json;
	} catch (e) {}
}

function generateEditorJsId() {
	return nanoid(10);
}

export function plainTextToEditorJsData(text: string): OutputData {
	return {
		blocks: text.split('\n').map(line => ({
			id: generateEditorJsId(),
			type: 'paragraph',
			data: {
				text: line,
			},
		})),
	};
}

export function decodedTextDataToEditorJsData(decodedTextData: IMessageDecodedTextData): OutputData | undefined {
	if (decodedTextData.type === MessageDecodedTextDataType.YMF) {
		return ymfToEditorJs(decodedTextData.value);
	} else {
		return decodeEditorJsData(decodedTextData.value);
	}
}

export function decodedTextDataToPlainText(decodedTextData: IMessageDecodedTextData): string | undefined {
	if (decodedTextData.type === MessageDecodedTextDataType.YMF) {
		return decodedTextData.value.toPlainText();
	} else {
		const data = decodeEditorJsData(decodedTextData.value);
		return data?.blocks.map((b: any) => b.data.text).join('\n');
	}
}

export function parseEditorJsJson(json: any) {
	try {
		json = typeof json === 'string' ? JSON.parse(json) : json;
	} catch (e) {
		return typeof json === 'string' ? json : JSON.stringify(json);
	}
	let result = '';

	for (const block of json.blocks) {
		if (block.type === 'paragraph') {
			result += block.data.text + '\n';
		} else if (block.type === 'header') {
			result += '#'.repeat(block.data.level) + ' ' + block.data.text + '\n';
		} else if (block.type === 'list') {
			let i = 1;
			for (const item of block.data.items) {
				result += (block.data.style === 'ordered' ? `${i}. ` : '- ') + item + '\n';
				i++;
			}
		} else if (block.type === 'delimiter') {
			result += '\n';
		} else if (block.type === 'image') {
			result += block.data.caption + '\n';
		} else if (block.type === 'embed') {
			result += block.data.caption + '\n';
		} else if (block.type === 'table') {
			result += block.data.caption + '\n';
		} else if (block.type === 'quote') {
			result += block.data.caption + '\n';
		} else if (block.type === 'code') {
			result += block.data.caption + '\n';
		} else if (block.type === 'raw') {
			result += block.data.caption + '\n';
		} else if (block.type === 'warning') {
			result += block.data.caption + '\n';
		} else if (block.type === 'linkTool') {
			result += block.data.caption + '\n';
		} else if (block.type === 'marker') {
			result += block.data.caption + '\n';
		} else if (block.type === 'checklist') {
			result += block.data.caption + '\n';
		} else if (block.type === 'inlineCode') {
			result += block.data.caption + '\n';
		} else if (block.type === 'simpleImage') {
			result += block.data.caption + '\n';
		} else if (block.type === 'underline') {
			result += block.data.caption + '\n';
		} else if (block.type === 'strikethrough') {
			result += block.data.caption + '\n';
		} else if (block.type === 'superscript') {
			result += block.data.caption + '\n';
		} else if (block.type === 'subscript') {
			result += block.data.caption + '\n';
		} else if (block.type === 'link') {
			result += block.data.caption + '\n';
		} else if (block.type === 'alignment') {
			result += block.data.caption + '\n';
		} else if (block.type === 'rawTool') {
			result += block.data.caption + '\n';
		} else if (block.type === 'del') {
			result += block.data.caption + '\n';
		} else if (block.type === 'inlineLink') {
			result += block.data.caption + '\n';
		} else if (block.type === 'mention') {
			result += block.data.caption + '\n';
		}
	}

	return result.replaceAll('<br>', '\n');
}

export function editorJsToYMF(json: any) {
	const nodes: string[] = [];
	for (const block of json.blocks) {
		if (block.type === 'paragraph') {
			nodes.push(`<p ejs-id="${block.id}">${block.data.text}</p>`); // data.text
		} else if (block.type === 'header') {
			// data.level -- number
			// data.text -- string
			nodes.push(`<h${block.data.level} ejs-id="${block.id}">${block.data.text}</h${block.data.level}>`);
		} else if (block.type === 'list') {
			// data.style: 'ordered' | 'unordered'
			// data.items: string[]
			if (block.data.style === 'ordered') {
				const innerNodes: string[] = [];
				for (let i = 0; i < block.data.items.length; i++) {
					innerNodes.push(`<li><ejs-bullet>${i + 1}. </ejs-bullet>${block.data.items[i]}</li>`);
				}
				nodes.push(`<ol ejs-id="${block.id}">${innerNodes.join('\n')}</ol>`);
			} else if (block.data.style === 'unordered') {
				const innerNodes: string[] = [];
				for (let i = 0; i < block.data.items.length; i++) {
					innerNodes.push(`<li><ejs-bullet>• </ejs-bullet>${block.data.items[i]}</li>`);
				}
				nodes.push(`<ul ejs-id="${block.id}">${innerNodes.join('\n')}</ul>`);
			}
		} else {
			// nothing
		}
	}
	return YMF.fromYMFText(`<editorjs>${nodes.join('\n')}</editorjs>`);
}

export function ymfToEditorJs(ymf: YMF) {
	if (
		ymf.root.children.length === 1 &&
		ymf.root.children[0].type === 'tag' &&
		ymf.root.children[0].tag === 'editorjs'
	) {
		const root: IYMFTagNode = ymf.root.children[0];
		const blocks: any[] = [];
		for (const child of root.children) {
			if (child.type === 'text') {
				// do nothing, skip line breaks
			} else if (child.type === 'tag') {
				if (child.tag === 'p') {
					blocks.push({
						id: child.attributes['ejs-id'],
						type: 'paragraph',
						data: {
							text: child.children.map(c => YMF.nodeToYMFText(c)).join(''),
						},
					});
				} else if (child.tag.startsWith('h')) {
					const level = parseInt(child.tag[1], 10);
					blocks.push({
						id: child.attributes['ejs-id'],
						type: 'header',
						data: {
							text: child.children.map(c => YMF.nodeToYMFText(c)).join(''),
							level,
						},
					});
				} else if (child.tag === 'ol') {
					blocks.push({
						id: child.attributes['ejs-id'],
						type: 'list',
						data: {
							style: 'ordered',
							items: child.children
								.filter(c => c.type === 'tag')
								.map(c =>
									(c as IYMFTagNode).children
										.slice(1)
										.map(c => YMF.nodeToYMFText(c))
										.join(''),
								),
						},
					});
				} else if (child.tag === 'ul') {
					blocks.push({
						id: child.attributes['ejs-id'],
						type: 'list',
						data: {
							style: 'unordered',
							items: child.children
								.filter(c => c.type === 'tag')
								.map(c =>
									(c as IYMFTagNode).children
										.slice(1)
										.map(c => YMF.nodeToYMFText(c))
										.join(''),
								),
						},
					});
				} else {
					// do nothing
				}
			}
		}

		return {
			time: 1676587472156,
			blocks,
			version: '2.26.5',
		};
	} else {
		return {
			time: 1676587472156,
			blocks: [{ id: '2cC8_Z_Rad', type: 'paragraph', data: { text: ymf.toPlainText() } }],
			version: '2.26.5',
		};
	}
}

//

export function formatSubject(subject: string, prefix?: string) {
	return `${prefix || ''}${subject || '(no subject)'}`;
}

//

export function useOpenMailCopmpose() {
	const location = useLocation();
	const navigate = useNav();

	return ({ mailData }: { mailData?: OutgoingMailData } = {}) => {
		if (location.pathname !== generatePath(RoutePath.MAIL_COMPOSE)) {
			if (browserStorage.widgetId === WidgetId.MAILBOX) {
				globalOutgoingMailData.reset(mailData);
				navigate(generatePath(RoutePath.MAIL_COMPOSE));
			} else {
				showStaticComponent(
					resolve => <ComposeMailPopup mailData={mailData || new OutgoingMailData()} onClose={resolve} />,
					{ singletonKey: COMPOSE_MAIL_POPUP_SINGLETON_KEY },
				);
			}
		}
	};
}
