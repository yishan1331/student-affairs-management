import { useNotification } from '@refinedev/core';

// Refine Notification 通知類型
type NotificationType = 'success' | 'error' | 'progress';

// Refine Notification 通知選項
interface NotificationOptions {
	message: string;
	description?: string;
	type?: NotificationType;
}

// Refine Notification Hook
export const useGlobalNotification = () => {
	const { open } = useNotification();

	const showNotification = (options: NotificationOptions) => {
		open?.({
			message: options.message,
			description: options.description,
			type: options.type || 'success',
		});
	};

	return {
		success: (message: string, description?: string) => {
			showNotification({
				message,
				description,
				type: 'success',
			});
		},
		dataProcessingSuccess: (message: string, description?: string) => {
			showNotification({
				message: `${message}成功`,
				description: `${description}已成功${message}`,
				type: 'success',
			});
		},
		error: (message: string, description?: string) => {
			showNotification({
				message,
				description,
				type: 'error',
			});
		},
		progress: (message: string, description?: string) => {
			showNotification({
				message,
				description,
				type: 'progress',
			});
		},
	};
};
