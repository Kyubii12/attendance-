// Admin login page uses its own layout — no Navbar/Footer
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
