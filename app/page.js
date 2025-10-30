import { Providers } from "./providers";
import NoSSR from "./components/NoSSR";
import HomeContent from "./components/HomeContent";

function HomeWrapper() {

  return (
    <NoSSR>
      <HomeContent />
    </NoSSR>
  );
}

export default function Home() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  );
}