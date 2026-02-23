import { message } from 'antd';
import { useEffect } from 'react';
import { initMessageInstance } from '../utils/message';

export const useGlobalMessage = () => {
	const [messageApi, contextHolder] = message.useMessage();

	// 初始化全局 message 實例
	useEffect(() => {
		initMessageInstance(messageApi);
	}, [messageApi]);

	return { contextHolder };
};
