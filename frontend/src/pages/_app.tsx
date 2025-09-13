import "../styles/globals.css";
import "../styles/basic.css";
import type { AppProps } from "next/app";
import 'leaflet/dist/leaflet.css'; // Import Leaflet's CSS globally

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
