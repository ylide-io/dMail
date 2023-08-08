import { generatePath } from 'react-router-dom';

import { ProjectAvatar } from '../../../components/avatar/avatar';
import { BlockchainProject } from '../../../stores/blockchainProjects/blockchainProjects';
import { RoutePath } from '../../../stores/routePath';
import { useNav } from '../../../utils/url';
import css from './regularProjectCard.module.scss';

export interface RegularProjectCardProps {
	project: BlockchainProject;
}

export function RegularProjectCard({ project }: RegularProjectCardProps) {
	const navigate = useNav();
	const href = generatePath(RoutePath.PROJECT, { projectId: project.id });

	return (
		<a
			className={css.root}
			href={href}
			onClick={e => {
				e.preventDefault();
				navigate(href);
			}}
		>
			<ProjectAvatar className={css.ava} image={project.profilePicture || 'https://picsum.photos/id/1067/200'} />

			<div className={css.name}>{project.name}</div>

			<div className={css.description}>{project.description}</div>
		</a>
	);
}
