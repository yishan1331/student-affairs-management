import { useGetToPath, useGo } from '@refinedev/core';
import { useSearchParams } from 'react-router';

type UseDrawerCloseProps = {
	onClose?: () => void;
	close?: () => void;
	resource?: string;
};

export const useDrawerClose = ({
	onClose,
	close,
	resource,
}: UseDrawerCloseProps) => {
	const getToPath = useGetToPath();
	const [searchParams] = useSearchParams();
	const go = useGo();

	const handleDrawerClose = () => {
		if (close) {
			close();
		}

		if (onClose) {
			onClose();
			return;
		}

		go({
			to:
				searchParams.get('to') ??
				(resource
					? getToPath({
							resource: { name: resource },
							action: 'list',
						})
					: '') ??
				'',
			query: {
				to: undefined,
			},
			options: {
				keepQuery: true,
			},
			type: 'replace',
		});
	};

	return {
		handleDrawerClose,
	};
};
