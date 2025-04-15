import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'e2e',
        include: ['packages/**/test/e2e/**/*.test.ts'],
        environment: 'node',
    },
})
