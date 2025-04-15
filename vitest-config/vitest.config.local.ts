import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['packages/**/test/local/**/*.test.ts'],
        environment: 'node',
    },
})
