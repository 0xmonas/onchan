import { useDarkMode } from '../contexts/DarkModeContext';

export default function Footer() {
  const { isDarkMode } = useDarkMode();

  return (
    <footer className={`${isDarkMode ? "bg-black" : "bg-card"} text-card-foreground py-4 px-4 sm:px-6 text-center mt-auto`}>
      <div className="container mx-auto">
        <p className="text-sm sm:text-base">&copy; 2024 Onchan. All rights reversed.</p>
        <nav className="mt-4">
          <ul className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
            <li><a href="#" className="text-sm sm:text-base hover:underline">Terms of Service</a></li>
            <li><a href="#" className="text-sm sm:text-base hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="text-sm sm:text-base hover:underline">Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}