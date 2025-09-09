/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push("mongodb-client-encryption");
        return config;
    },
};

export default nextConfig;
