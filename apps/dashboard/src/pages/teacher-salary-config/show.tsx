import {
	useShow,
	useParsed,
	useCan,
	useResource,
	useOne,
} from "@refinedev/core";
import { Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import {
	ITeacherSalaryConfig,
	ICourse,
	ISalaryBase,
} from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const TeacherSalaryConfigShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.teacherSalaryConfig,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as ITeacherSalaryConfig;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.teacherSalaryConfig,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.teacherSalaryConfig,
		action: "delete",
	});

	const { data: courseData } = useOne<ICourse>({
		resource: ROUTE_RESOURCE.course,
		id: record?.course_id,
		queryOptions: {
			enabled: !!record?.course_id,
		},
	});
	const course = courseData?.data;

	const { data: salaryBaseData } = useOne<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
		id: record?.salary_base_id,
		queryOptions: {
			enabled: !!record?.salary_base_id,
		},
	});
	const salaryBase = salaryBaseData?.data;

	const dataSources: DataSource<ITeacherSalaryConfig>[] = [
		{
			label: "課程",
			value: "course_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>{course?.name}</Typography.Text>
				);
			},
		},
		{
			label: "薪資基底",
			value: "salary_base_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>{salaryBase?.name}</Typography.Text>
				);
			},
		},
		{
			label: "時薪",
			value: "salary_base_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						${salaryBase?.hourly_rate}
					</Typography.Text>
				);
			},
		},
		{ label: "修改者ID", value: "modifier_id", type: "text" },
		{
			label: "建立時間",
			value: "created_at",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{dayjs(record?.created_at).format("YYYY-MM-DD")}
					</Typography.Text>
				);
			},
		},
		{
			label: "修改時間",
			value: "updated_at",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{dayjs(record?.updated_at).format("YYYY-MM-DD")}
					</Typography.Text>
				);
			},
		},
	];

	if (isError) {
		return (
			<Alert
				message="錯誤"
				description={error?.message || "載入資料時發生錯誤"}
				type="error"
				showIcon
			/>
		);
	}

	return (
		<Show
			isLoading={isFetching}
			title={`${resource?.meta?.label}資料`}
			canDelete={canDelete?.can}
			canEdit={canEdit?.can}
			breadcrumb={
				<CustomBreadcrumb
					items={[
						{
							title: resource?.meta?.label || "",
							path: resource?.list?.toString() || "",
						},
						{
							title: `${resource?.meta?.label}資料`,
						},
					]}
				/>
			}
			headerButtons={({
				deleteButtonProps,
				editButtonProps,
				refreshButtonProps,
			}) => (
				<CustomShowHeaderButtons
					deleteButtonProps={{
						...deleteButtonProps,
						successNotification: {
							message: "刪除成功",
							description: `${resource?.meta?.label}已成功刪除`,
							type: "success",
						},
						errorNotification: {
							message: "刪除失敗",
							description: `無法刪除${resource?.meta?.label}`,
							type: "error",
						},
					}}
					editButtonProps={editButtonProps}
					refreshButtonProps={{
						...refreshButtonProps,
						onClick: () => query.refetch(),
					}}
					resource={ROUTE_RESOURCE.teacherSalaryConfig}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
