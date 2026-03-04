import { createStyles } from 'antd-style';
import { red, green } from '@ant-design/colors';

export const useStyles = createStyles(({ token }) => {
	return {
		uploadDragger: {
			width: '100% !important',
			height: '100% !important',
			marginLeft: 'auto',
			marginRight: 'auto',
			padding: '16px',

			'.ant-upload-drag': {
				width: 'min(240px, 100%) !important',
				height: 'min(240px, 60vw) !important',
				marginLeft: 'auto',
				marginRight: 'auto',
				border: 'none',
				backgroundColor: token.colorBgContainer,
			},
			'.ant-upload-btn': {
				padding: '0px !important',
			},
		},
		formItem: {
			backgroundColor: token.colorBgContainer,
			padding: '16px',
			margin: 0,
			borderBottom: `1px solid ${token.colorBorderSecondary}`,
		},
		segmented: {
			'.inactice': {
				'&.ant-segmented-item-selected': {
					backgroundColor: red[1],
					borderColor: red[3],
					color: red[7],
				},
			},
			'.actice': {
				'&.ant-segmented-item-selected': {
					backgroundColor: green[1],
					borderColor: green[3],
					color: green[7],
				},
			},
		},
	};
});
