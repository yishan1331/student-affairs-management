import React from "react";
import Icon from "@ant-design/icons";

// 貓掌自訂 SVG 圖示
const PawSvg = () => (
	<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
		<path d="M512 640c-88 0-160 56-160 136 0 80 72 136 160 136s160-56 160-136c0-80-72-136-160-136zm-224-128c-44 0-80 44-80 96s36 96 80 96 80-44 80-96-36-96-80-96zm448 0c-44 0-80 44-80 96s36 96 80 96 80-44 80-96-36-96-80-96zm-336-224c-44 0-80 44-80 96s36 96 80 96 80-44 80-96-36-96-80-96zm224 0c-44 0-80 44-80 96s36 96 80 96 80-44 80-96-36-96-80-96z" />
	</svg>
);
export const PawOutlined = (props: any) => (
	<Icon component={PawSvg} {...props} style={{ transform: "scale(1.3)", ...props?.style }} />
);

// 馬桶自訂 SVG 圖示
const ToiletSvg = () => (
	<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
		<path d="M704 128H320c-17.7 0-32 14.3-32 32v128h448V160c0-17.7-14.3-32-32-32zM256 352c-53 0-96 43-96 96 0 46.4 33 85.1 76.8 94.2L288 864h448l51.2-321.8C831 533.1 864 494.4 864 448c0-53-43-96-96-96H256zm480 64c17.7 0 32 14.3 32 32s-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32h448zM384 896h256v32H384v-32z" />
	</svg>
);
export const ToiletOutlined = (props: any) => (
	<Icon component={ToiletSvg} {...props} />
);
