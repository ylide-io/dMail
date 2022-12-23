import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNav } from '../../../utils/navigate';
import modals from '../../../stores/Modals';
import clsx from 'clsx';

interface TagProps {
	circleColor: string;
	text: string;
	tagId?: number;
	isActive?: boolean;
	icon: string;
}

const Tag: React.FC<TagProps> = ({ icon, circleColor, text, isActive, tagId }) => {
	const location = useLocation();
	const navigate = useNav();

	const styles = { cursor: 'pointer' };

	const activeStyles = {
		fontWeight: 'bold',
		backgroundColor: 'rgba(26,179,148,0.15)',
	};

	const clickHandler = () => {
		if (location.pathname !== `/${tagId}`) {
			navigate(`/${tagId}`);
			modals.sidebarOpen = false;
		}
		// mailer.filterByFolder(tagId || null);
	};

	return (
		<div className="tag-list-item" onClick={clickHandler}>
			<div className="tag-list-item-title" style={isActive ? { ...styles, ...activeStyles } : styles}>
				<i className={clsx('fa fa-circle text-navy')} style={{ color: circleColor }} /> {text}
			</div>
		</div>
	);
};

export default Tag;
