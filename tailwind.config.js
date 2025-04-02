/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        rubik: ['Rubik-Regular','sans-sarif'],
        "rubik-extrabold": ['Rubik-ExtraBold','sans-sarif'],
        "rubik-light": ['Rubik-Light','sans-sarif'],
        "rubik-medium": ['Rubik-Medium','sans-sarif'],
        "rubik-bold": ['Rubik-Bold','sans-sarif'],
        "rubik-semibold": ['Rubik-SemiBold','sans-sarif'],
        "barlow-black": ['Barlow-Black','sans-sarif'],
        barlow: ['Barlow','sans-sarif'],
        "barlow-medium": ['Barlow-Medium','sans-sarif'],
        "barlow-semibold": ['Barlow-SemiBold','sans-sarif'],
      },
      colors:{
        primary : '#fff',
        accent: '#7b80ff',
        main: '#1f2630',
        black: {
          DEFAULT : '#000000',
          100: '#8C8E98',
          200:'#666876',
          300:'#191d31',
        },
        danger: '#F75555'
      }
    },
  },
  plugins: [],
}