import { PureComponent } from 'react';

import MailboxControls from './MailboxControls';
import MailsCounter from './MailsCounter';

export class MailboxHeader extends PureComponent {
	render() {
		return (
			<div className="mailbox-header">
				{/* <MailsSearcher /> */}
				<MailsCounter />
				<MailboxControls />
			</div>
		);
	}
}
