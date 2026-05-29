import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Results - GitaGuide',
  description: 'Your personalized Bhagavad Gita wisdom search results',
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
