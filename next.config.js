/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // tsconfig.json의 "paths" 항목을 webpack-alias로 그대로 적용
        tsconfigPaths: true,
      },
};
module.exports = nextConfig;
