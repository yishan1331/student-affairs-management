import { Edit, SaveButton, useForm } from "@refinedev/antd";
import { useParsed, useResource } from "@refinedev/core";

import { IUpdatePet } from "../../common/types/models";
import { PetForm } from "./form/form";
import { ROUTE_RESOURCE } from "../../common/constants";
import { CustomBreadcrumb } from "../../components";
import { useGlobalNotification } from "../../hooks/useGlobalNotification";

export const PetEdit = () => {
	const { id } = useParsed();
	const { dataProcessingSuccess } = useGlobalNotification();
	const { resource } = useResource();

	const action = "修改";

	const { formProps, saveButtonProps } = useForm<IUpdatePet>({
		resource: ROUTE_RESOURCE.pet,
		id,
		action: "edit",
		redirect: false,
		onMutationSuccess: () => {
			dataProcessingSuccess(action, resource?.meta?.label);
		},
		onMutationError: (error) => {
			console.error("Pet Edit Error:", error);
		},
		successNotification: false,
		errorNotification: false,
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
			<PetForm formProps={{ ...formProps }} />
		</Edit>
	);
};
