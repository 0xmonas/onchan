import { useDarkMode } from '../contexts/DarkModeContext';
import Link from 'next/link';

export default function Footer({ className }) {
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
    <footer className={`${className} text-card-foreground transition-all duration-300`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center py-4 md:py-0 md:h-[75px]">
          <span className="text-xs md:text-sm opacity-70 mb-1 md:mb-2">&copy; 2024 Onchan. All rights reserved.</span>
          <nav>
            <ul className="flex flex-wrap justify-center space-x-2 md:space-x-4">
              {links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-xs md:text-sm whitespace-nowrap hover:underline opacity-70 hover:opacity-100 transition-opacity"
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