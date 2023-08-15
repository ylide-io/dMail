import clsx from 'clsx';

import { useOnMountAnimation } from '../../utils/useOnMountAnimation';
import { Popup } from '../popup/popup';
import { PropsWithClassName } from '../props';
import css from './overlay.module.scss';

export interface OverlayProps extends PropsWithClassName {
	isHidden?: boolean;
	isBlur?: boolean;
	onClick?: () => void;
}

export function Overlay({ className, isHidden, isBlur, onClick }: OverlayProps) {
	const isVisible = useOnMountAnimation();

	return (
		<Popup
			className={clsx(css.root, !isHidden && isVisible && css.root_visible, isBlur && css.root_blur, className)}
			onClick={() => onClick?.()}
		/>
	);
}
