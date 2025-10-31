// src/styles/authStyles.ts
export const authStyles = {
    container: (theme: string) =>
        `min-h-screen flex items-center justify-center relative transition-colors duration-500 overflow-hidden bg-cover bg-center ${theme === "dark" ? "bg-neutral-900 text-white" : "bg-neutral-50 text-gray-900"
        }`,

    overlay: (theme: string) =>
        `absolute inset-0 ${theme === "dark"
            ? "bg-black/50"
            : "bg-gradient-to-b from-white/80 via-white/60 to-white/80"
        } backdrop-blur-sm`,

    card: (theme: string) =>
        `relative z-10 w-[90%] sm:w-[400px] md:w-[420px] p-6 sm:p-8 rounded-2xl shadow-lg backdrop-blur-md ${theme === "dark" ? "bg-white/10" : "bg-white"
        }`,
    input: `
    w-full px-3 py-2 rounded-md border
    focus:outline-none focus:ring-2 focus:ring-primary-500
    transition-all duration-200
    bg-white text-gray-900
    dark:bg-gray-800 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    border-gray-300 dark:border-gray-600
  `,

    button:
        "w-full py-2 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base",

    link: "text-primary-600 font-medium hover:underline",

    heading: "text-2xl sm:text-3xl font-bold text-center mb-6 leading-tight",

    watermark: (theme: string) =>
        `absolute text-[8rem] sm:text-[11rem] font-extrabold tracking-widest opacity-10 select-none ${theme === "dark" ? "text-white" : "text-gray-800"
        }`,
};
