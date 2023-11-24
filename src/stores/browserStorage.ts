import { WalletAccount } from '@ylide/sdk';
import { makeAutoObservable } from 'mobx';

import { Section } from '../components/genericLayout/sidebar/sidebarMenu';
import { WidgetId } from '../pages/widgets/widgets';
import { toggleArrayItem } from '../utils/array';

enum BrowserStorageKey {
	ADMIN_PASSWORD = 'ylide_adminPassword',
	IS_MAIN_VIEW_BANNER_HIDDEN = 'ylide_isMainViewBannerHidden',
	ACCOUNT_REMOTE_KEYS = 'ylide_accountRemoteKeys',
	SIDEBAR_FOLDED_SECTIONS = 'ylide_sidebarFoldedSections',
	SAVE_DECODED_MESSAGES = 'ylide_saveDecodedMessages',
	WIDGET_ID = 'ylide_widgetId',
	MAIN_VIEW_KEYS = 'ylide_mainViewKeys',
	REFERRER = 'ylide_referrer',
	LAST_MAILBOX_INCOMING_DATE = 'ylide_lastMailboxCheckDate',
	SAVED_ACCOUNTS = 'ylide_savedAccounts',
}

export interface SavedAccount {
	name: string;
	account: WalletAccount;
	wallet: string;
}

class BrowserStorage {
	constructor() {
		makeAutoObservable(this);
	}

	private static getItem<T = string>(key: BrowserStorageKey, storage: Storage = localStorage) {
		return (storage.getItem(key) as T) || undefined;
	}

	private static getItemWithTransform<T>(
		key: BrowserStorageKey,
		transform: (item: string) => T,
		storage: Storage = localStorage,
	): T | undefined {
		const item = storage.getItem(key) || undefined;
		return item ? transform(item) : undefined;
	}

	private static setItem(key: BrowserStorageKey, value: any, storage: Storage = localStorage) {
		if (value != null) {
			storage.setItem(key, value.toString());
		} else {
			storage.removeItem(key);
		}
	}

	private _savedAccounts =
		BrowserStorage.getItemWithTransform<SavedAccount[]>(BrowserStorageKey.SAVED_ACCOUNTS, val => {
			const parsed = JSON.parse(val);
			if (!Array.isArray(parsed)) {
				return [];
			} else {
				return parsed.map((acc: any) => ({
					...acc,
					account: WalletAccount.fromBase64(acc.account),
				}));
			}
		}) || [];

	get savedAccounts() {
		return this._savedAccounts;
	}

	set savedAccounts(value: SavedAccount[]) {
		BrowserStorage.setItem(
			BrowserStorageKey.SAVED_ACCOUNTS,
			JSON.stringify(
				value.map(v => ({
					...v,
					account: v.account.toBase64(),
				})),
			),
		);
		this._savedAccounts = value;
	}

	//

	private _adminPassword = BrowserStorage.getItem(BrowserStorageKey.ADMIN_PASSWORD, sessionStorage);

	get adminPassword() {
		return this._adminPassword;
	}

	set adminPassword(value: string | undefined) {
		BrowserStorage.setItem(BrowserStorageKey.ADMIN_PASSWORD, value, sessionStorage);
		this._adminPassword = value;
	}

	get isUserAdmin() {
		return !!this.adminPassword;
	}

	//

	private _isMainViewBannerHidden = BrowserStorage.getItem(BrowserStorageKey.IS_MAIN_VIEW_BANNER_HIDDEN) === 'true';

	get isMainViewBannerHidden() {
		return this._isMainViewBannerHidden;
	}

	set isMainViewBannerHidden(value: boolean) {
		BrowserStorage.setItem(BrowserStorageKey.IS_MAIN_VIEW_BANNER_HIDDEN, value);
		this._isMainViewBannerHidden = value;
	}

	private _sidebarFoldedSections =
		BrowserStorage.getItemWithTransform(
			BrowserStorageKey.SIDEBAR_FOLDED_SECTIONS,
			item => item.split(',') as Section[],
		) || [];

	isSidebarSectionFolded(section: Section) {
		return this._sidebarFoldedSections.includes(section);
	}

	toggleSidebarSectionFolding(section: Section) {
		const newValue = toggleArrayItem(this._sidebarFoldedSections, section);
		BrowserStorage.setItem(
			BrowserStorageKey.SIDEBAR_FOLDED_SECTIONS,
			newValue.length ? newValue.join(',') : undefined,
		);
		this._sidebarFoldedSections = newValue;
	}

	//

	private _saveDecodedMessages = BrowserStorage.getItem(BrowserStorageKey.SAVE_DECODED_MESSAGES) !== 'false';

	get saveDecodedMessages() {
		return this._saveDecodedMessages;
	}

	set saveDecodedMessages(value: boolean) {
		BrowserStorage.setItem(BrowserStorageKey.SAVE_DECODED_MESSAGES, value);
		this._saveDecodedMessages = value;
	}

	//

	private _widgetId = BrowserStorage.getItem<WidgetId>(BrowserStorageKey.WIDGET_ID, sessionStorage);

	get widgetId() {
		return this._widgetId;
	}

	set widgetId(value: WidgetId | undefined) {
		BrowserStorage.setItem(BrowserStorageKey.WIDGET_ID, value, sessionStorage);
		this._widgetId = value;
	}

	//

	private _mainViewKeys =
		BrowserStorage.getItemWithTransform(
			BrowserStorageKey.MAIN_VIEW_KEYS,
			item => JSON.parse(item) as Record<string, string | undefined>,
		) || {};

	get mainViewKeys() {
		return this._mainViewKeys;
	}

	set mainViewKeys(value: Record<string, string | undefined>) {
		BrowserStorage.setItem(BrowserStorageKey.MAIN_VIEW_KEYS, JSON.stringify(value));
		this._mainViewKeys = value;
	}

	//

	get referrer() {
		return BrowserStorage.getItem(BrowserStorageKey.REFERRER) || '';
	}

	set referrer(value: string) {
		BrowserStorage.setItem(BrowserStorageKey.REFERRER, value);
	}

	//

	private _lastMailboxCheckDate: Record<string, number> =
		BrowserStorage.getItemWithTransform(BrowserStorageKey.LAST_MAILBOX_INCOMING_DATE, JSON.parse) || {};

	get lastMailboxCheckDate() {
		return this._lastMailboxCheckDate;
	}

	set lastMailboxCheckDate(value: Record<string, number>) {
		BrowserStorage.setItem(BrowserStorageKey.LAST_MAILBOX_INCOMING_DATE, JSON.stringify(value));
		this._lastMailboxCheckDate = value;
	}
}

export const browserStorage = new BrowserStorage();
// @ts-ignore
window.browserStorage = browserStorage;
