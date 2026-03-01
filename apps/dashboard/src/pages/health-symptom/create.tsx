import { useGetToPath, useGo, useParsed, useResource } from "@refinedev/core";
import { useSearchParams } from "react-router";
import { Create, SaveButton, useForm } from "@refinedev/antd";

import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";
import { ROUTE_RESOURCE } from "../../common/constants";
import { ICreateHealthSymptom } from "../../common/types/models";
import { HealthSymptomForm } from "./form/form";

export const HealthSymptomCreate = () => {
	const getToPath = useGetToPath();
	const [searchParams] = useSearchParams();
	const go = useGo();

	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "新增";

	const { formProps, saveButtonProps } = useForm<ICreateHealthSymptom>({
		resource: ROUTE_RESOURCE.healthSymptom,
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
			console.error("HealthSymptom Create Error:", error);
		},
		successNotification: false,
		errorNotification: false,
	});

	const title = `${action}${resource?.meta?.label?.slice(0, 2)}`;

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
			<HealthSymptomForm formProps={{ ...formProps }} />
		</Create>
	);
};
