import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { useParsed, useResource } from "@refinedev/core";

import { ISchoolUpdate } from "../../common/types/models";
import { SchoolForm } from "./form/form";
import { ROUTE_RESOURCE } from "../../common/constants";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";

export const SchoolEdit = () => {
	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "修改";

	const { formProps, saveButtonProps } = useForm<ISchoolUpdate>({
		resource: ROUTE_RESOURCE.school,
		id,
		action: "edit",
		redirect: false,
		onMutationSuccess: () => {
			dataProcessingSuccess(action, resource?.meta?.label);
		},
		successNotification: false,
		errorNotification: false,
		meta: {
			auditLog: {
				permissions: ["school:update"],
			},
		},
	});

	const title = `${action}${resource?.meta?.label}`;

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
			<SchoolForm formProps={{ ...formProps }} />
		</Edit>
	);
};
