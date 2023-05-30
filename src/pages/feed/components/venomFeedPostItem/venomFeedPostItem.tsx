import { MessageAttachmentLinkV1 } from '@ylide/sdk';
import React, { useMemo, useRef } from 'react';

import { AdaptiveAddress } from '../../../../components/adaptiveAddress/adaptiveAddress';
import { NlToBr } from '../../../../components/nlToBr/nlToBr';
import { ReadableDate } from '../../../../components/readableDate/readableDate';
import { ReactComponent as ContactSvg } from '../../../../icons/ic20/contact.svg';
import { ReactComponent as ExternalSvg } from '../../../../icons/ic20/external.svg';
import { IMessageDecodedContent, MessageDecodedTextDataType } from '../../../../indexedDB/IndexedDB';
import { ILinkedMessage } from '../../../../stores/MailList';
import { ipfsToHttpUrl } from '../../../../utils/ipfs';
import css from './venomFeedPostItem.module.scss';

interface VenomFeedPostItemProps {
	message: ILinkedMessage;
	decoded: IMessageDecodedContent;
}

export function VenomFeedPostItem({ message, decoded: { decodedTextData, attachments } }: VenomFeedPostItemProps) {
	const selfRef = useRef<HTMLDivElement>(null);

	const decodedText = useMemo(
		() =>
			decodedTextData.type === MessageDecodedTextDataType.PLAIN
				? decodedTextData.value
				: decodedTextData.value.toPlainText(),
		[decodedTextData],
	);
	const attachment = attachments[0] as MessageAttachmentLinkV1 | undefined;

	return (
		<div ref={selfRef} className={css.root}>
			<div className={css.ava}>
				<ContactSvg width="100%" height="100%" />
			</div>

			<div className={css.meta}>
				<AdaptiveAddress className={css.sender} maxLength={12} address={message.msg.senderAddress} />

				<div className={css.metaRight}>
					<ReadableDate className={css.date} value={message.msg.createdAt * 1000} />

					{!!message.msg.$$meta.id && (
						<a
							className={css.metaButton}
							href={`https://testnet.venomscan.com/messages/${message.msg.$$meta.id}`}
							target="_blank"
							rel="noreferrer"
							title="Details"
						>
							<ExternalSvg />
						</a>
					)}
				</div>
			</div>

			<div className={css.body}>
				<NlToBr text={decodedText} />

				{attachment && <img className={css.cover} alt="Attachment" src={ipfsToHttpUrl(attachment.link)} />}
			</div>
		</div>
	);
}
