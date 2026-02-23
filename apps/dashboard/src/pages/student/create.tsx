import { useGetToPath, useGo, useParsed, useResource } from "@refinedev/core";
import { useSearchParams } from "react-router";
import { Create, SaveButton, useForm } from "@refinedev/antd";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";
import { ROUTE_RESOURCE } from "../../common/constants";
import { ICreateStudent } from "../../common/types/models";
import { StudentForm } from "./form/form";

export const StudentCreate = () => {
	const getToPath = useGetToPath();
	const [searchParams] = useSearchParams();
	const go = useGo();

	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "新增";

	const { formProps, saveButtonProps } = useForm<ICreateStudent>({
		resource: ROUTE_RESOURCE.student,
		id,
		action: "create",
		redirect: false,
		onMutationSuccess: () => {
			dataProcessingSuccess(
				action,
				`${resource?.meta?.label?.slice(0, 2)}資料`
			);
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
		successNotification: false,
		errorNotification: false,
		meta: {
			auditLog: {
				permissions: ["student:create"],
			},
		},
	});

	const title = `${action}${resource?.meta?.label?.slice(0, 2)}資料`;

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
			<StudentForm formProps={{ ...formProps }} />
		</Create>
	);
};
