import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { TooltipProvider } from '@components/layouts/ui/tooltip';

export const metadata: Metadata = {
    title: {
        template: '%s | Demo - NextJS Template',
        default: 'Demo - NextJS Template',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <TooltipProvider>
                    <ProviderComponent>{children}</ProviderComponent>
                </TooltipProvider>
            </body>
        </html>
    );
}
