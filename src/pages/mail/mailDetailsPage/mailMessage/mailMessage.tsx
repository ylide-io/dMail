import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createReactEditorJS } from 'react-editor-js';

import { ActionButton, ActionButtonLook } from '../../../../components/ActionButton/ActionButton';
import { Blockie } from '../../../../components/blockie/blockie';
import { ContactName } from '../../../../components/contactName/contactName';
import { ReadableDate } from '../../../../components/readableDate/readableDate';
import { toast } from '../../../../components/toast/toast';
import { ReactComponent as AddContactSvg } from '../../../../icons/ic20/addContact.svg';
import { ReactComponent as ForwardSvg } from '../../../../icons/ic20/forward.svg';
import { ReactComponent as ReplySvg } from '../../../../icons/ic20/reply.svg';
import { ReactComponent as TrashSvg } from '../../../../icons/ic20/trash.svg';
import { IContact, IMessageDecodedContent } from '../../../../indexedDB/IndexedDB';
import contacts from '../../../../stores/Contacts';
import { FolderId, ILinkedMessage, mailStore } from '../../../../stores/MailList';
import { formatAddress } from '../../../../utils/blockchain';
import { DateFormatStyle } from '../../../../utils/date';
import { decodedTextDataToEditorJsData, EDITOR_JS_TOOLS } from '../../../../utils/editorJs';
import { formatSubject } from '../../../../utils/mail';
import css from './mailMessage.module.scss';

const ReactEditorJS = createReactEditorJS();

export interface MailMessageProps {
	message: ILinkedMessage;
	decoded?: IMessageDecodedContent;
	folderId?: FolderId;
	onReady?: () => void;
	onReplyClick: () => void;
	onForwardClick: () => void;
	onDeleteClick: () => void;
}

export const MailMessage = observer(
	({ message, decoded, folderId, onReady, onReplyClick, onForwardClick, onDeleteClick }: MailMessageProps) => {
		const editorData = useMemo(
			() => decodedTextDataToEditorJsData(decoded?.decodedTextData || undefined),
			[decoded],
		);

		const onDecodeClick = () => {
			mailStore.decodeMessage(message);
		};

		const [isEditorReady, setEditorReady] = useState(!editorData);
		useEffect(() => {
			if (isEditorReady) {
				onReady?.();
			}
		}, [isEditorReady, onReady]);

		return (
			<div className={css.root}>
				<Blockie className={css.avatar} address={message.msg.senderAddress} />

				<div className={css.title}>{decoded ? formatSubject(decoded.decodedSubject) : '[Encrypted]'}</div>

				<div className={css.actions}>
					{decoded ? (
						<>
							<ActionButton icon={<ReplySvg />} onClick={() => onReplyClick()}>
								Reply
							</ActionButton>

							<ActionButton icon={<ForwardSvg />} title="Forward" onClick={() => onForwardClick()} />

							{folderId !== FolderId.Archive && (
								<ActionButton
									look={ActionButtonLook.DANGEROUS}
									icon={<TrashSvg />}
									title="Archive"
									onClick={() => onDeleteClick()}
								/>
							)}
						</>
					) : (
						<ActionButton onClick={() => onDecodeClick()}>Decode message</ActionButton>
					)}
				</div>

				<div className={css.sender}>
					<div className={css.senderLabel}>
						{folderId === FolderId.Sent
							? message.recipients.length > 1
								? 'Receivers'
								: 'Receiver'
							: 'Sender'}
						:
					</div>

					<div className={css.senderList}>
						{(folderId === FolderId.Sent
							? message.recipients.length
								? message.recipients
								: [formatAddress(message.msg.recipientAddress)]
							: [message.msg.senderAddress]
						).map(address => {
							const contact = contacts.find({ address });

							return (
								<div className={css.senderRow}>
									<ContactName address={address} />

									{!contact && (
										<ActionButton
											className={css.addContactButton}
											icon={<AddContactSvg />}
											title="Create contact"
											onClick={() => {
												const name = prompt('Enter contact name:')?.trim();
												if (!name) return;

												const contact: IContact = {
													name,
													description: '',
													address,
													tags: [],
												};

												contacts.createContact(contact).catch(() => toast("Couldn't save 😒"));
											}}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<ReadableDate className={css.date} style={DateFormatStyle.LONG} value={message.msg.createdAt * 1000} />

				{editorData?.blocks && (
					<div className={css.body}>
						<ReactEditorJS
							tools={EDITOR_JS_TOOLS}
							readOnly={true}
							//@ts-ignore
							data={editorData}
							onReady={() => setEditorReady(true)}
						/>
					</div>
				)}
			</div>
		);
	},
);
