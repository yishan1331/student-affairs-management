import { message } from 'antd';

// Antd Message 通知選項
interface MessageOptions {
	duration?: number;
	key?: string;
}

// 創建一個全局的 message 實例
let messageInstance: ReturnType<typeof message.useMessage>[0] | null = null;

// 初始化 message 實例
export const initMessageInstance = (
	instance: ReturnType<typeof message.useMessage>[0],
) => {
	messageInstance = instance;
};

// 在非 React 組件中使用全局 showMessage 函數
// 導出一個全局的 showMessage 函數
export const showMessage = {
	success: (content: string, options?: MessageOptions) => {
		if (messageInstance) {
			messageInstance.success(content, options?.duration);
		} else {
			message.success(content, options?.duration);
		}
	},
	error: (content: string, options?: MessageOptions) => {
		if (messageInstance) {
			messageInstance.error(content, options?.duration);
		} else {
			message.error(content, options?.duration);
		}
	},
	info: (content: string, options?: MessageOptions) => {
		if (messageInstance) {
			messageInstance.info(content, options?.duration);
		} else {
			message.info(content, options?.duration);
		}
	},
	warning: (content: string, options?: MessageOptions) => {
		if (messageInstance) {
			messageInstance.warning(content, options?.duration);
		} else {
			message.warning(content, options?.duration);
		}
	},
};
