/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'cdn.vox-cdn.com', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')].filter(Boolean),
    },
}

module.exports = nextConfig

