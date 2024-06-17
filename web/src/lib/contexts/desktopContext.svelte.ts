import { getContext, setContext } from 'svelte';

export type DesktopContext = {
	currentApplication: string | undefined;
	setCurrentApplication: (app: string) => void;
	closeCurrentApplication: () => void;
};

const contextName = 'desktop';

export const createDesktopContext = () => {
	let currentApplication = $state<DesktopContext['currentApplication']>();

	const context = {
		get currentApplication() {
			return currentApplication;
		},
		setCurrentApplication(application) {
			currentApplication = application;
		},
		closeCurrentApplication() {
			currentApplication = undefined;
		}
	} satisfies DesktopContext;

	setContext(contextName, context);

	return context;
};

export const getDesktopContext = () => {
	const context = getContext<DesktopContext | undefined>(contextName);

	if (!context) {
		throw new Error('DesktopContext must be created before attempting to access');
	}

	return context;
};
