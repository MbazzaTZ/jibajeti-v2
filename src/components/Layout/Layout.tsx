import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <View className="min-h-screen bg-background">
      <Header />
      <View className="container py-6 md:py-8">
        {children}
      </View>
      <Footer />
      <BottomNav />
    </View>
  );
};
