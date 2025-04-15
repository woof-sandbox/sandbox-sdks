import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        name: 'unit',
        include: ['packages/**/test/unit/**/*.test.ts'],
        environment: 'node',
    },
})
