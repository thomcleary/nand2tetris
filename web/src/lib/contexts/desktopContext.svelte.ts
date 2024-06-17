export type DesktopContext = {
	currentApplication: string | undefined;
};

export const DesktopContext = $state<DesktopContext>({ currentApplication: undefined });
