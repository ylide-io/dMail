import { action, makeObservable, observable, runInAction } from 'mobx';

import { FeedServerApi, LinkType } from '../api/feedServerApi';
import { BaseFeedProject, BaseFeedSource, FeedSourcesScope } from '../shared/FeedSourcesScope';

export class FeedProject extends BaseFeedProject {
	readonly id: number;
	readonly name: string;

	constructor(public readonly store: FeedSourcesStore, id: number, name: string) {
		super(id);

		this.id = id;
		this.name = name;
	}
}

export class FeedSource extends BaseFeedSource {
	id: number;
	name: string;
	origin?: string;
	avatar?: string;
	link: string;
	type: LinkType;
	projectId: number | null;

	constructor(
		public readonly store: FeedSourcesStore,
		id: number,
		name: string,
		link: string,
		type: LinkType,
		projectId: number | null,
		origin?: string,
		avatar?: string,
	) {
		super(id, projectId);

		this.id = id;
		this.name = name;
		this.link = link;
		this.type = type;
		this.projectId = projectId;
		this.origin = origin;
		this.avatar = avatar;
	}

	get project(): FeedProject | null {
		return this.projectId ? this.store.projectsMap.get(this.projectId) || null : null;
	}
}

export class FeedSourcesStore extends FeedSourcesScope<FeedProject, FeedSource> {
	isError = false;
	loaded = false;
	loading = true;

	constructor() {
		super();

		makeObservable(this, {
			isError: observable,
			loaded: observable,
			loading: observable,

			projectsMap: observable,
			projectsArray: observable,
			sourcesMap: observable,
			sourcesArray: observable,
			sourcesByProjectId: observable,

			updateSources: action,
			updateProjects: action,
			updateProjectsAndSources: action,
		});

		FeedServerApi.getSources()
			.then(({ projects, sources }) => {
				runInAction(() => {
					this.loading = false;
					this.loaded = true;
					this.updateRawProjectsAndSources(projects, sources);
				});
			})
			.catch(() => (this.isError = true));
	}

	buildRawSources(newSources: FeedServerApi.RawFeedSource[]) {
		return newSources.map(s => {
			return new FeedSource(this, Number(s.id), s.name, s.link, s.type, s.projectId || null, s.origin, s.avatar);
		});
	}

	buildRawProjects(newProjects: FeedServerApi.RawFeedProject[]) {
		return newProjects.map(project => {
			return new FeedProject(this, project.id, project.name);
		});
	}

	updateRawProjectsAndSources(projects: FeedServerApi.RawFeedProject[], sources: FeedServerApi.RawFeedSource[]) {
		this.updateProjects(this.buildRawProjects(projects));
		this.updateSources(this.buildRawSources(sources));
	}
}
