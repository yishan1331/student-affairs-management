import { useLink } from "@refinedev/core";
import { Space, theme } from "antd";
import styled from "@emotion/styled";

import { HeaderLogoIcon } from "../icons";

type TitleProps = {
	collapsed: boolean;
};

const Logo = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const ThemedTitleV2: React.FC<TitleProps> = ({ collapsed }) => {
	const { token } = theme.useToken();
	const Link = useLink();

	return (
		<Link to="/">
			{/* {collapsed ? (
				<HeaderLogoIcon width={60} height={60} />
			) : (
				<Logo>
					<HeaderLogoIcon width={60} height={60} />
				</Logo>
			)} */}
			<Logo>
				SAMS
				{/* <HeaderLogoIcon width={60} height={60} /> */}
			</Logo>
		</Link>
	);
};
