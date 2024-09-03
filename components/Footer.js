import { useDarkMode } from '../contexts/DarkModeContext';
import Link from 'next/link';

export default function Footer() {
  const { isDarkMode } = useDarkMode();

  const links = [
    { href: '#', label: 'contact' },
    { href: '#', label: 'rules' },
    { href: '#', label: 'careers' },
    { href: '#', label: 'terms of use' },
    { href: '#', label: 'privacy policy' },
    { href: '#', label: 'faq' },
    { href: '#', label: '𝕏' },
  ];

  return (
    <footer className={`${
      isDarkMode 
        ? "bg-black bg-opacity-50" 
        : "bg-card bg-opacity-50"
    } text-card-foreground py-3 px-4 text-center mt-auto`}>
      <div className="container mx-auto max-w-full">
        <div className="flex flex-col items-center space-y-3">
          <span className="text-[13px] opacity-70">&copy; 2024 Onchan. All rights reserved.</span>
          <nav className="w-full overflow-x-auto scrollbar-hide">
            <ul className="flex flex-nowrap justify-center space-x-4 min-w-max px-4">
              {links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-[13px] whitespace-nowrap hover:underline opacity-70 hover:opacity-100 transition-opacity"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}