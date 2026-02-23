import { useGetToPath, useGo, useParsed, useResource } from "@refinedev/core";
import { useSearchParams } from "react-router";
import { Create, SaveButton, useForm } from "@refinedev/antd";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";
import { ROUTE_RESOURCE } from "../../common/constants";
import { ICreateTeacherSalaryConfig } from "../../common/types/models";
import { TeacherSalaryConfigForm } from "./form/form";

export const TeacherSalaryConfigCreate = () => {
	const getToPath = useGetToPath();
	const [searchParams] = useSearchParams();
	const go = useGo();

	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "新增";

	const { formProps, saveButtonProps } =
		useForm<ICreateTeacherSalaryConfig>({
			resource: ROUTE_RESOURCE.teacherSalaryConfig,
			id,
			action: "create",
			redirect: false,
			onMutationSuccess: () => {
				dataProcessingSuccess(action, resource?.meta?.label);
				go({
					to:
						searchParams.get("to") ??
						getToPath({
							action: "list",
						}) ??
						"",
					query: {
						to: undefined,
					},
					options: {
						keepQuery: true,
					},
					type: "replace",
				});
			},
			onMutationError: (error) => {
				console.error(
					"=== TeacherSalaryConfig Create - onMutationError ==="
				);
				console.error("Mutation error:", error);
			},
			successNotification: false,
			errorNotification: false,
			meta: {
				auditLog: {
					permissions: ["teacher-salary-config:create"],
				},
			},
		});

	const title = `${action}${resource?.meta?.label}`;

	return (
		<Create
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
			<TeacherSalaryConfigForm formProps={{ ...formProps }} />
		</Create>
	);
};
