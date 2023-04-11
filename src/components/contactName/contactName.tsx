import { observer } from 'mobx-react';

import contacts from '../../stores/Contacts';
import { AdaptiveAddress } from '../adaptiveAddress/adaptiveAddress';
import { AdaptiveText } from '../adaptiveText/adaptiveText';
import { PropsWithClassName } from '../propsWithClassName';

export interface ContactNameProps extends PropsWithClassName {
	address: string;
	noTooltip?: boolean;
}

export const ContactName = observer(({ className, address, noTooltip }: ContactNameProps) => {
	const contact = contacts.find({ address });

	return (
		<>
			{contact ? (
				<AdaptiveText className={className} text={contact.name} />
			) : (
				<AdaptiveAddress className={className} address={address} noTooltip={noTooltip} />
			)}
		</>
	);
});
