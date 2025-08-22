function ToggleDark() {
  return (
    <button
      className="dark-checkbox w-10 h-10  p-2 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-300 absolute top-7 right-16 sm:right-4"
      onClick={toggleDarkMode}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="128"
        height="128"
        viewBox="0 0 24 24"
        fill="black"
        stroke="#000000"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=" w-full h-full object-cover hidden"
        id="light-mode-icon"
      >
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
        <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
        <path d="M19 11h2m-1 -1v2" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="128"
        height="128"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className=" w-full h-full object-cover"
        id="dark-mode-icon"
      >
        <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M12 5l0 -2" />
        <path d="M17 7l1.4 -1.4" />
        <path d="M19 12l2 0" />
        <path d="M17 17l1.4 1.4" />
        <path d="M12 19l0 2" />
        <path d="M7 17l-1.4 1.4" />
        <path d="M6 12l-2 0" />
        <path d="M7 7l-1.4 -1.4" />
      </svg>
    </button>
  );
}
function toggleDarkMode() {
  const darkModeIcon = document.getElementById("dark-mode-icon");
  const lightModeIcon = document.getElementById("light-mode-icon");

  if (localStorage.getItem("darkMode") !== "true") {
    localStorage.setItem("darkMode", "true");
    document.documentElement.classList.add("dark");
    lightModeIcon?.classList.remove("mode-display-block");
    lightModeIcon?.classList.add("mode-display-none");
    darkModeIcon?.classList.remove("mode-display-none");
    darkModeIcon?.classList.add("mode-display-block");
  } else {
    localStorage.setItem("darkMode", "false");
    document.documentElement.classList.remove("dark");
    darkModeIcon?.classList.remove("mode-display-block");
    darkModeIcon?.classList.add("mode-display-none");
    lightModeIcon?.classList.remove("mode-display-none");
    lightModeIcon?.classList.add("mode-display-block");
  }
}

function checkDarkMode() {
  const storedDarkMode = localStorage.getItem("darkMode");
  if (storedDarkMode === "true") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  const darkModeIcon = document.getElementById("dark-mode-icon");
  const lightModeIcon = document.getElementById("light-mode-icon");
  if (storedDarkMode === "true") {
    lightModeIcon?.classList.remove("mode-display-block");
    lightModeIcon?.classList.add("mode-display-none");
    darkModeIcon?.classList.remove("mode-display-none");
    darkModeIcon?.classList.add("mode-display-block");
  } else {
    darkModeIcon?.classList.remove("mode-display-block");
    darkModeIcon?.classList.add("mode-display-none");
    lightModeIcon?.classList.remove("mode-display-none");
    lightModeIcon?.classList.add("mode-display-block");
  }
}

window.addEventListener("load", checkDarkMode);
export default ToggleDark;
