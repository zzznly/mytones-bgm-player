// styles
import "./style.scss";

// components
import NavBar from "@components/organisms/NavBar";
import Header from "@components/organisms/Header";
import Player from "@components/organisms/Player";

// router
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

// utils
import { getToken } from "@utils/auth";
import { isSpinnerLoading } from "@service/Common/CommonAtom";
import Loading from "@components/atoms/Loading";
import { useAtom } from "jotai";
import useSDK from "@store/sdk/useSDK";

export default function MainLayout(): JSX.Element {
  // loading
  const [isLoading, setLoading] = useAtom(isSpinnerLoading);

  // player states
  const { deviceId, setDeviceId } = useSDK();

  const [duration_ms, setDurationMs] = useState<number>(0);
  const [current_track, setTrack] = useState({});
  const [current_position, setPosition] = useState(0);
  const [is_paused, setPaused] = useState(true);

  const token = getToken();

  // 플레이어 생성
  useEffect(() => {
    console.log("useEffect PlayerInstance");
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new (window as any).Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb: any) => {
          cb(token?.replace(/\"/g, ""));
        },
        volume: 0.5,
      });

      // console.log("player instance", playerInstance);

      playerInstance.addListener("ready", (event: { deviceId: string }) => {
        // @ts-ignore // TODO: 타입에러 해결
        setDeviceId(event.deviceId);
        console.log("Ready with Device ID", event.deviceId);
      });

      playerInstance.addListener("progress", (state: any) => {
        setPosition(state.position);
      });

      playerInstance.addListener("not_ready", (event: { deviceId: string }) => {
        console.log("Device ID has gone offline", event.deviceId);
      });

      playerInstance.addListener("player_state_changed", (state: any) => {
        if (!state) {
          return;
        }
        setTrack(state?.track_window.current_track);
        setPaused(state?.paused);
        setDurationMs(state?.duration);
        console.log("state changed", state);
      });

      playerInstance.connect().then((res: boolean) => {
        console.log("player connected", res);
        setLoading(false);
      });
    };
  }, [token]);

  return (
    <div className="layout layout--row">
      <NavBar />
      <div className="layout__content">
        <Header />
        <div className="layout__content-main">
          <Outlet />
        </div>
      </div>
      <Player
        {...{
          current_track,
          is_paused,
          deviceId,
          current_position,
          duration_ms,
        }}
      />
      {isLoading && <Loading />}
    </div>
  );
}
