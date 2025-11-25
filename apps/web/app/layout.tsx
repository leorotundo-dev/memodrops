import "./globals.css";

export const metadata = {
  title: "MemoDrops Admin",
  description: "Painel de gestão do MemoDrops"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}
