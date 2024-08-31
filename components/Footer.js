import { useDarkMode } from '../contexts/DarkModeContext';

export default function Footer() {
  const { isDarkMode } = useDarkMode();

  return (
    <footer className={`${
      isDarkMode 
        ? "bg-black bg-opacity-50" 
        : "bg-card bg-opacity-50"
    } text-card-foreground py-2 sm:py-4 px-2 sm:px-6 text-center mt-auto`}>
      <div className="container mx-auto">
        <p className="text-xs sm:text-sm md:text-base opacity-70">&copy; 2024 Onchan. All rights reversed.</p>
        <nav className="mt-2 sm:mt-4">
          <ul className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
            <li><a href="#" className="text-xs sm:text-sm md:text-base hover:underline opacity-70 hover:opacity-100 transition-opacity">Terms of Service</a></li>
            <li><a href="#" className="text-xs sm:text-sm md:text-base hover:underline opacity-70 hover:opacity-100 transition-opacity">Privacy Policy</a></li>
            <li><a href="#" className="text-xs sm:text-sm md:text-base hover:underline opacity-70 hover:opacity-100 transition-opacity">Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}