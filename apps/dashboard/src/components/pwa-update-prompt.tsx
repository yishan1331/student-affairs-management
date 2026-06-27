import { useEffect } from 'react';
import { App as AntdApp, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRegisterSW } from 'virtual:pwa-register/react';

// 偵測到新版時主動向使用者檢查的間隔（毫秒）。iOS PWA 不會在背景檢查，
// 因此另外在分頁切回前景時也補一次 update()。
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 小時

const NOTIFICATION_KEY = 'pwa-update-available';

/**
 * PWA 更新提示。
 * registerType 設為 'prompt'，偵測到新版 Service Worker 時不會自動重載，
 * 改由此元件跳出「立即更新」提示，使用者點擊後才切換到新版並重新整理。
 */
export const PWAUpdatePrompt: React.FC = () => {
	const { notification } = AntdApp.useApp();

	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (!registration) return;

			// 定期主動檢查是否有新版
			setInterval(() => {
				registration.update();
			}, UPDATE_CHECK_INTERVAL);

			// 分頁切回前景時也檢查一次（iOS PWA 冷啟動以外的補強）
			const onVisible = () => {
				if (document.visibilityState === 'visible') {
					registration.update();
				}
			};
			document.addEventListener('visibilitychange', onVisible);
		},
	});

	useEffect(() => {
		if (!needRefresh) return;

		notification.open({
			key: NOTIFICATION_KEY,
			message: '有新版本可用',
			description: '系統已更新，點擊「立即更新」載入最新版本。',
			duration: 0,
			placement: 'top',
			btn: (
				<Space>
					<Button
						size="small"
						onClick={() => {
							setNeedRefresh(false);
							notification.destroy(NOTIFICATION_KEY);
						}}
					>
						稍後
					</Button>
					<Button
						type="primary"
						size="small"
						icon={<ReloadOutlined />}
						onClick={() => {
							// 切換到新 SW 並重新整理載入新版
							updateServiceWorker(true);
						}}
					>
						立即更新
					</Button>
				</Space>
			),
		});
	}, [needRefresh, notification, setNeedRefresh, updateServiceWorker]);

	return null;
};
