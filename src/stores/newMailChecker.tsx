import { autorun, IReactionDisposer, makeAutoObservable, makeObservable, observable, reaction } from 'mobx';

import { BrowserStorage, BrowserStorageKey } from './browserStorage';
import domain from './Domain';
import { FolderId, ILinkedMessage, MailList } from './MailList';
import { DomainAccount } from './models/DomainAccount';

class MailListWrapper {
	@observable.ref private readonly mailList: MailList;
	@observable.ref private readonly disposer: IReactionDisposer;

	@observable.ref lastMessage: ILinkedMessage | undefined;

	constructor(accounts: DomainAccount[]) {
		makeObservable(this);

		const mailList = (this.mailList = new MailList());

		mailList.init({
			mailbox: {
				accounts,
				folderId: FolderId.Inbox,
			},
		});

		this.disposer = autorun(() => {
			if (mailList.newMessagesCount) {
				mailList.drainNewMessages();
			}

			this.lastMessage = mailList.messages[0];
		});
	}

	destroy() {
		this.mailList.destroy();
		this.disposer();
	}
}

//

class NewMailChecker {
	private _lastIncomingDateSec =
		BrowserStorage.getItemWithTransform(BrowserStorageKey.LAST_MAILBOX_INCOMING_DATE, item => +item) || 0;

	private listWrapper: MailListWrapper | undefined;

	constructor() {
		makeAutoObservable(this);
	}

	init() {
		// Re-create MailListWrapper when accounts change
		reaction(
			() => domain.accounts.activeAccounts,
			accounts => {
				if (this.listWrapper) {
					this.listWrapper?.destroy();
					this.listWrapper = undefined;

					this.lastIncomingDateSec = 0;
				}

				if (accounts.length) {
					this.listWrapper = new MailListWrapper(domain.accounts.activeAccounts);
				}
			},
			{
				fireImmediately: true,
			},
		);

		// Set lastIncomingDateSec if it's not set yet
		reaction(
			() => this.listWrapper?.lastMessage,
			lastMessage => {
				if (lastMessage && !this.lastIncomingDateSec) {
					this.lastIncomingDateSec = lastMessage.msg.createdAt;
				}
			},
		);
	}

	private get lastIncomingDateSec() {
		return this._lastIncomingDateSec;
	}

	private set lastIncomingDateSec(value: number) {
		BrowserStorage.setJsonItem(BrowserStorageKey.LAST_MAILBOX_INCOMING_DATE, value);
		this._lastIncomingDateSec = value;
	}

	get hasNewMessages() {
		const lastMessage = this.listWrapper?.lastMessage;
		const lastIncomingDateSec = this.lastIncomingDateSec;

		return !!lastMessage && !!lastIncomingDateSec && lastMessage.msg.createdAt > lastIncomingDateSec;
	}

	inboxOpened() {
		this.lastIncomingDateSec = Math.round(Date.now() / 1000);
	}
}

export const newMailChecker = new NewMailChecker();