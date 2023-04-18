import { IGenericAccount } from '@ylide/sdk';

import { Wallet } from '../../stores/models/Wallet';
import { truncateInMiddle } from '../../utils/string';
import { ActionButton, ActionButtonLook, ActionButtonSize } from '../ActionButton/ActionButton';
import { Modal } from '../modal/modal';
import css from './selectWalletTypeModal.module.scss';

export enum WalletType {
	REGULAR = 'REGULAR',
	PROXY = 'PROXY',
}

export interface SelectWalletTypeModalProps {
	proxyAccount: {
		wallet: Wallet;
		account: IGenericAccount;
	};
	onClose?: (type?: WalletType) => void;
}

export function SelectWalletTypeModal({ proxyAccount, onClose }: SelectWalletTypeModalProps) {
	return (
		<Modal className={css.root} onClose={onClose}>
			<div className={css.title}>Connect same account?</div>

			<div className={css.description}>
				We noticed that you're using Ylide within another application. You can connect the same account as the
				parent application uses – <b>{truncateInMiddle(proxyAccount.account.address, 10, '...')}</b>
				<br />
				<br />
				We recommend connect the same account to get seamless user experience.
			</div>

			<div className={css.buttons}>
				<ActionButton
					size={ActionButtonSize.XLARGE}
					look={ActionButtonLook.PRIMARY}
					onClick={() => onClose?.(WalletType.PROXY)}
				>
					Connect same account
				</ActionButton>

				<ActionButton
					size={ActionButtonSize.XLARGE}
					look={ActionButtonLook.LITE}
					onClick={() => onClose?.(WalletType.REGULAR)}
				>
					Use another one
				</ActionButton>
			</div>
		</Modal>
	);
}
