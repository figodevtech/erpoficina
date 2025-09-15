// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        slideIn: "slideIn 2s linear infinite",
      },
    },
  },
};
