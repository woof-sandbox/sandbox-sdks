import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'all',
        include: ['test/unit/**/*.test.ts'],
        environment: 'node',
    },
})
