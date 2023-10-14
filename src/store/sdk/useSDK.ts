// useSDK.js
import { useAtom } from "jotai";
import { deviceIDAtom } from "./atom";

const useSDK = () => {
  const [deviceId, setDeviceId] = useAtom<string>(deviceIDAtom);

  return {
    deviceId,
    setDeviceId,
  };
};

export default useSDK;