import axios from "axios";
import type { HttpError } from "@refinedev/core";
import { showMessage } from "../../../utils/message";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const rawMessage = error.response?.data?.message;
    const errorMessage = Array.isArray(rawMessage)
      ? rawMessage.join("、")
      : rawMessage || "發生未知錯誤";

    const statusCode = error.response?.status;

    // 401 不顯示通知（由 auth provider 處理跳轉）
    if (statusCode !== 401) {
      showMessage.error(errorMessage);
    }

    const customError: HttpError = {
      ...error,
      message: errorMessage,
      statusCode,
    };

    return Promise.reject(customError);
  }
);

export { axiosInstance };
