import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { useParsed, useResource } from "@refinedev/core";

import { IUpdateStudent } from "../../common/types/models";
import { StudentForm } from "./form/form";
import { ROUTE_RESOURCE } from "../../common/constants";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";

export const StudentEdit = () => {
	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "修改";

	const { formProps, saveButtonProps } = useForm<IUpdateStudent>({
		resource: ROUTE_RESOURCE.student,
		id,
		action: "edit",
		redirect: false,
		onMutationSuccess: () => {
			dataProcessingSuccess(
				action,
				`${resource?.meta?.label?.slice(0, 2)}資料`
			);
		},
		successNotification: false,
		errorNotification: false,
		meta: {
			auditLog: {
				permissions: ["student:update"],
			},
		},
	});

	const title = `${action}${resource?.meta?.label?.slice(0, 2)}資料`;

	return (
		<Edit
			saveButtonProps={saveButtonProps}
			title={title}
			breadcrumb={
				<CustomBreadcrumb
					items={[
						{
							title: resource?.meta?.label || "",
							path: resource?.list?.toString(),
						},
						{
							title: title,
						},
					]}
				/>
			}
			headerButtons={<></>}
			footerButtons={({ saveButtonProps }) => (
				<>
					<SaveButton {...saveButtonProps} type="primary">
						儲存
					</SaveButton>
				</>
			)}
		>
			<StudentForm formProps={{ ...formProps }} />
		</Edit>
	);
};
