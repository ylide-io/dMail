export enum RoutePath {
	TEST = '/test',
	ADMIN = '/admin',
	ADMIN_FEED = '/admin/feed',

	ROOT = '/',
	ANY = '/*',

	// APP

	SETTINGS = '/settings',

	WALLETS = '/wallets',
	WALLETS_CONNECT = '/connect-wallets',

	MAIL_ROOT = '/mail',
	MAIL_COMPOSE = '/mail/compose',
	MAIL_CONTACTS = '/mail/contacts',
	MAIL_CONTACT_TAGS = '/mail/contacts/tags',
	MAIL_FOLDER = '/mail/:folderId',
	MAIL_DETAILS = '/mail/:folderId/:id',
	MAIL_DETAILS_OUTLET = ':id',

	FEED_ROOT = '/feed',
	FEED_ALL = '/feed/all',
	FEED_POST = '/feed/post/:postId',
	FEED_CATEGORY = '/feed/tag/:tag',
	FEED_SOURCE = '/feed/source/:source',
	FEED_SMART = '/feed/smart',
	FEED_SMART_ADDRESS = '/feed/smart/:address',

	PROJECT_ROOT = '/project',
	PROJECT = '/project/:projectId',
	PROJECT_OFFICIAL = '/project/:projectId/announcements',
	PROJECT_OFFICIAL_ADMIN = '/project/:projectId/announcements/admin',
	PROJECT_POST = '/project/:projectId/post/:postId',
	PROJECT_DISCUSSION = '/project/:projectId/discussion',
	PROJECT_DISCUSSION_ADMIN = '/project/:projectId/discussion/admin',

	OTC_ROOT = '/otc',
	OTC_ASSETS = '/otc/assets',
	OTC_WALLETS = '/otc/wallets',
	OTC_CHATS = '/otc/chats',
	OTC_CHAT = '/otc/chats/:address',

	// WIDGETS

	SEND_MESSAGE_WIDGET = '/widget/send-message',
	MAILBOX_WIDGET = '/widget/mailbox',
}
