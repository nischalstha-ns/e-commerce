import HomeContent from "./components/HomeContent";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Nischal Fancy Store',
  description: 'Discover quality products at Nischal Fancy Store - your trusted online shopping destination',
  keywords: 'ecommerce, online store, quality products, shopping',
  openGraph: {
    title: 'Home | Nischal Fancy Store',
    description: 'Discover quality products at Nischal Fancy Store',
    type: 'website',
  },
};

export default function Home(): JSX.Element {
  return <HomeContent />;
}