import { Tooltip } from 'antd';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';

import { REACT_APP__OTC_MODE } from '../../../env';
import { ReactComponent as ArrowDownSvg } from '../../../icons/ic20/arrowDown.svg';
import { ReactComponent as CrossSvg } from '../../../icons/ic20/cross.svg';
import { ReactComponent as PlusSvg } from '../../../icons/ic20/plus.svg';
import { ReactComponent as ContactsSvg } from '../../../icons/ic28/contacts.svg';
import { YlideLargeLogo } from '../../../icons/YlideLargeLogo';
import { postWidgetMessage, WidgetId, WidgetMessageType } from '../../../pages/widgets/widgets';
import { browserStorage } from '../../../stores/browserStorage';
import domain from '../../../stores/Domain';
import mailer from '../../../stores/Mailer';
import { RoutePath } from '../../../stores/routePath';
import { connectAccount } from '../../../utils/account';
import { useOpenMailCopmpose } from '../../../utils/mail';
import { useNav } from '../../../utils/url';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../../ActionButton/ActionButton';
import { Blockie } from '../../blockie/blockie';
import { useToastManager } from '../../toast/toast';
import { SidebarBurger } from '../sidebar/sidebarMenu';
import { AccountsPopup } from './accountsPopup/accountsPopup';
import css from './header.module.scss';

const Header = observer(() => {
	const navigate = useNav();
	const { toast } = useToastManager();
	const openMailCopmpose = useOpenMailCopmpose();

	const accountsPopupButtonRef = useRef(null);
	const [isAccountsPopupOpen, setAccountsPopupOpen] = useState(false);

	return (
		<div className={css.root}>
			<SidebarBurger className={css.burger} />

			{domain.accounts.hasActiveAccounts && (
				<ActionButton
					className={css.composeButton}
					look={ActionButtonLook.PRIMARY}
					onClick={() => openMailCopmpose()}
				>
					Compose Mail
				</ActionButton>
			)}

			<div className={css.logo}>
				<a
					href={generatePath(RoutePath.ROOT)}
					onClick={e => {
						e.preventDefault();
						navigate(generatePath(RoutePath.ROOT));
					}}
				>
					<YlideLargeLogo className={css.logoImage} />
				</a>
			</div>

			<div className={css.main}>
				{REACT_APP__OTC_MODE || !domain.accounts.hasActiveAccounts || (
					<Tooltip title="Contacts">
						<ActionButton
							size={ActionButtonSize.MEDIUM}
							look={ActionButtonLook.LITE}
							icon={<ContactsSvg />}
							onClick={e => {
								e.preventDefault();
								navigate(generatePath(RoutePath.MAIL_CONTACTS));
							}}
						/>
					</Tooltip>
				)}

				{domain.accounts.hasActiveAccounts ? (
					<>
						<button
							ref={accountsPopupButtonRef}
							className={css.users}
							onClick={() => setAccountsPopupOpen(!isAccountsPopupOpen)}
						>
							<div>
								{domain.accounts.accounts.map(acc => (
									<Blockie
										key={acc.account.address}
										className={css.usersAvatar}
										address={acc.account.address}
									/>
								))}
							</div>

							<div className={css.usersText}>
								{domain.accounts.accounts.length} account
								{domain.accounts.accounts.length > 1 ? 's' : ''}
								<span>&nbsp;connected</span>
							</div>

							<ArrowDownSvg className={css.usersIcon} />
						</button>

						{isAccountsPopupOpen && (
							<AccountsPopup
								anchorRef={accountsPopupButtonRef}
								onClose={() => setAccountsPopupOpen(false)}
							/>
						)}
					</>
				) : (
					<ActionButton
						size={ActionButtonSize.MEDIUM}
						look={ActionButtonLook.PRIMARY}
						icon={<PlusSvg />}
						onClick={() => connectAccount()}
					>
						Connect account
					</ActionButton>
				)}

				{browserStorage.widgetId === WidgetId.MAILBOX && (
					<ActionButton
						size={ActionButtonSize.LARGE}
						look={ActionButtonLook.LITE}
						icon={<CrossSvg style={{ width: 28, height: 28 }} />}
						title="Close"
						onClick={() => {
							if (mailer.sending) {
								toast('Please wait. Sending is in progress 👌');
							} else {
								postWidgetMessage(WidgetMessageType.MAILBOX__CLOSE);
							}
						}}
					/>
				)}
			</div>
		</div>
	);
});

export default Header;
