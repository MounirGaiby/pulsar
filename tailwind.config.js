module.exports = {
    content: [
        './app/views/**/*.erb',
        './app/components/**/*.erb',
        './app/helpers/**/*.rb',
        './app/javascript/**/*.js',
    ],
    theme: {
        extend: {
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            colors: {
                'primary': '#2563eb', // blue-600
                'primary-light': '#3b82f6', // blue-500
                'background': '#f9fafb', // gray-50
                'card': '#fff',
            },
            boxShadow: {
                'card': '0 2px 8px 0 rgba(0,0,0,0.04)',
            },
            transitionProperty: {
                'width': 'width',
                'spacing': 'margin, padding',
            },
        },
    },
    plugins: [],
}
